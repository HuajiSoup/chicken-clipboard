import { invoke } from "@tauri-apps/api/core";
import Clip from "../models/clip";
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { ClipDeletedPayload, ClipSavedPayload, ClipUpdatedPayload } from "../models/clipEvents";

const buildIdMap = (items: Clip[]) => {
  return new Map<number, number>(items.map((clip, index) => [clip.id, index]));
};

const useClips = (query: string) => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [clipsFiltered, setClipsFiltered] = useState<Clip[]>([]);

  const clipsRef = useRef<Clip[]>([]);
  const queryRef = useRef<string>(query);
  const idMapRef = useRef<Map<number, number>>(new Map());

  const searchClips = () => {
    console.log("Searching clips with query:", queryRef.current);
    if (queryRef.current.trim().length === 0) return;

    invoke("search_clips", { query: queryRef.current })
      .then((fetchedClips) => {
        console.log("Fetched filtered clips:", fetchedClips);
        setClipsFiltered(fetchedClips as Clip[]);
      })
      .catch((error) => {
        console.log("Error fetching filtered clips:", error);
      });
  }

  const applyNextClips = (nextClips: Clip[]) => {
    // do least operations to clips
    clipsRef.current = nextClips;
    idMapRef.current = buildIdMap(nextClips);
    setClips(nextClips);

    // and just search again is ok (length < 30)
    searchClips();
  };

  useEffect(() => {
    // it only runs once, afterwards all operations are be done to `clips`
    const fetchInitClips = () => {
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
        const nextClips = [newClip, ...prevClips];
        applyNextClips(nextClips);
      });

      const unlistenUpdate = listen<ClipUpdatedPayload>("clipboard://update", (event) => {
        const updatedClip = event.payload;
        console.log("Clip updated:", updatedClip);

        const idx = idMapRef.current.get(updatedClip.id);
        if (typeof idx !== "number") return;

        const prevClips = clipsRef.current;
        const nextClips = [...prevClips];
        nextClips[idx].content = updatedClip.content;
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

    fetchInitClips();
    const unlisten = startListen();

    return unlisten;
  }, []);

  useEffect(() => {
    queryRef.current = query;
    searchClips();
  }, [query]);

  return [clips, clipsFiltered, idMapRef.current] as const;
}

export default useClips;