import { List } from "react-window";
import useClips from "../../utils/useClips";

import ClipBox from "../ClipBox";

import "./index.scss";

const ClipList: React.FC = () => {
  const [clips, idMap] = useClips();

  const handleClickClip = (e: React.MouseEvent<HTMLDivElement>) => {
    const clicked = (e.target as HTMLElement).closest(".clipbox") as HTMLElement | null;
    if (!clicked) return;

    const clipId = Number(clicked.dataset.clipId);
    if (Number.isNaN(clipId)) return;

    const idx = idMap.get(clipId);
    if (typeof idx !== "number") return;

    console.log("Clicked clip:", clips[idx]);
  }

  return (<>
    <div className="cliplist-wrapper">
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