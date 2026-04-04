import { invoke } from "@tauri-apps/api/core";
import Clip from "../models/clip";
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { ClipDeletedPayload, ClipSavedPayload, ClipUpdatedPayload } from "../models/clipEvents";

const buildIdMap = (items: Clip[]) => {
  return new Map<number, number>(items.map((clip, index) => [clip.id, index]));
};

const useClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const clipsRef = useRef<Clip[]>([]);
  const idMapRef = useRef<Map<number, number>>(new Map());

  const applyNextClips = (nextClips: Clip[]) => {
    clipsRef.current = nextClips;
    idMapRef.current = buildIdMap(nextClips);
    setClips(nextClips);
  };

  useEffect(() => {
    const fetchClips = async () => {
      invoke("get_all_clips")
        .then((fetchedClips) => {
          applyNextClips(fetchedClips as Clip[]);
        })
        .catch((error) => {
          console.error("Error fetching clips:", error);
        });
    };

    const startListen = () => {
      const unlistenSave = listen<ClipSavedPayload>("clipboard://save", (event) => {
        const newClip = event.payload;
        console.log("New clip saved:", newClip);

        const prevClips = clipsRef.current;
        const idx = idMapRef.current.get(newClip.id);
        
        if (typeof idx !== "number") {
          // new clip
          const nextClips = [newClip, ...prevClips];
          applyNextClips(nextClips);
        } else {
          // update clip date
          const nextClips = [...prevClips];
          nextClips.splice(idx, 1);
          nextClips.unshift(newClip);
          applyNextClips(nextClips);
        }
      });

      const unlistenUpdate = listen<ClipUpdatedPayload>("clipboard://update", (event) => {
        const updatedClip = event.payload;
        console.log("Clip updated:", updatedClip);

        const idx = idMapRef.current.get(updatedClip.id);
        if (typeof idx !== "number") return;

        const prevClips = clipsRef.current;
        const nextClips = [...prevClips];
        nextClips.splice(idx, 1);
        nextClips.unshift(updatedClip);
        applyNextClips(nextClips);
      });

      const unlistenDelete = listen<ClipDeletedPayload>("clipboard://delete", (event) => {
        const deletedId = event.payload.id;
        console.log("Clip deleted:", deletedId);

        const idx = idMapRef.current.get(deletedId);
        if (typeof idx !== "number") return;

        const nextClips = [...clipsRef.current];
        nextClips.splice(idx, 1);
        applyNextClips(nextClips);
      });

      return () => {
        unlistenSave.then(f => f());
        unlistenUpdate.then(f => f());
        unlistenDelete.then(f => f());
      }
    }

    fetchClips();
    const unlisten = startListen();

    return unlisten;
  }, []);

  return [clips, idMapRef.current] as const;
}

export default useClips;