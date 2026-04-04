import { invoke } from "@tauri-apps/api/core";
import Clip from "../models/clip";
import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { ClipDeletedPayload, ClipSavedPayload, ClipUpdatedPayload } from "../models/clipEvents";

const useClips = () => {
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    const fetchClips = async () => {
      invoke("get_all_clips")
        .then((fetchedClips) => {
          setClips(fetchedClips as Clip[]);
        })
        .catch((error) => {
          console.error("Error fetching clips:", error);
        });
    };

    const startListen = () => {
      const unlistenSave = listen<ClipSavedPayload>("clipboard://save", (event) => {
        const newClip = event.payload;
        setClips((prevClips) => [newClip, ...prevClips]);
      });

      const unlistenUpdate = listen<ClipUpdatedPayload>("clipboard://update", (event) => {
        const updatedClip = event.payload;
        setClips((prevClips) => {
          const idx = idMap.get(updatedClip.id);
          if (typeof idx !== "number") return prevClips;

          const newClips = [...prevClips];
          newClips.splice(idx, 1);
          newClips.unshift(updatedClip);
          return newClips;
        });
      });

      const unlistenDelete = listen<ClipDeletedPayload>("clipboard://delete", (event) => {
        const deletedId = event.payload.id;
        setClips((prevClips) => prevClips.filter(clip => clip.id !== deletedId));
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

  const idMap = useMemo(() => {
    return new Map<number, number>(clips.map((clip, index) => [clip.id, index]));
  }, [clips]);

  return [clips, idMap] as const;
}

export default useClips;