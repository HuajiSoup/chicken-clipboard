import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { List } from "react-window";

import ClipBox from "../ClipBox";
import Clip from "../../models/clip";

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
    fetchClips();
  }, []);

  const clipById = useMemo(() => {
    return new Map<number, number>(clips.map((clip, index) => [clip.id, index]));
  }, [clips]);

  const handleClickClip = (e: React.MouseEvent<HTMLDivElement>) => {
    const clicked = (e.target as HTMLElement).closest(".clipbox") as HTMLElement | null;
    if (!clicked) return;

    const clipId = Number(clicked.dataset.clipId);
    if (Number.isNaN(clipId)) return;

    const idx = clipById.get(clipId);
    if (typeof idx !== "number") return;

    console.log("Clicked clip:", clips[idx]);
  }

  return (<>
    <div className="cliplist-wrapper" onClick={fetchClips}>
      {/* <Tester /> */}
      <List 
        className="cliplist"
        onClick={handleClickClip}
        rowComponent={ClipBox}
        rowProps={{ clips }}
        rowCount={clips.length}
        rowHeight={65}
      />
    </div>
  </>);
}

export default ClipList;