import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import ClipBox from "../ClipBox";
import Clip from "../../models/clip";
import Tester from "../Tester";

import "./index.scss";


const ClipList: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  
  const fetchClips = async () => {
    try {
      const fetchedClips = await invoke("get_all_clips") as Clip[];
      setClips(fetchedClips);
    } catch (error) {
      console.error("Error fetching clips:", error);
    }
  };

  useEffect(() => {
    const initAndFetch = async () => {
      await fetchClips();
    }
    initAndFetch();
  }, []);

  const clipById = useMemo(() => {
    return new Map<number, number>(clips.map((clip, index) => [clip.id, index]));
  }, [clips]);

  const handleClickClip = (e: React.MouseEvent<HTMLDivElement>) => {
    const clicked = (e.target as HTMLElement).closest(".clipbox") as HTMLElement | null;
    if (!clicked) return;

    const clipId = Number(clicked.dataset.clipId);
    if (Number.isNaN(clipId)) return;

    const selectedClipIndex = clipById.get(clipId);
    if (typeof selectedClipIndex !== "number") return;

    console.log("Clicked clip:", clips[selectedClipIndex]);
  }

  return (<>
    <div className="cliplist-wrapper" onClick={fetchClips}>
      <Tester />
      <div className="cliplist" onClick={handleClickClip}>
        {clips.map((clip) => (
          <ClipBox key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  </>);
}

export default ClipList;