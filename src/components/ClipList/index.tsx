import { useEffect, useMemo, useState } from "react";
import ClipBox from "../ClipBox";
import Clip from "../../models/clip";
import { getClips, initDatabase } from "../../utils/dbop";

import "./index.scss";

const ClipList: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  
  const init = async () => await initDatabase();
  const fetchClips = async () => setClips(await getClips());

  useEffect(() => {
    const initAndFetch = async () => {
      await init();
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
      <div className="cliplist" onClick={handleClickClip}>
        {clips.map((clip) => (
          <ClipBox key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  </>);
}

export default ClipList;