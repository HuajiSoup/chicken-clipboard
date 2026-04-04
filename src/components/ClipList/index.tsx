import { List } from "react-window";
import useClips from "../../utils/useClips";
import ClipBox from "../ClipBox";
import { memo, useContext } from "react";
import { EditorContext } from "../../App";
import { writeText as clipboardWriteText } from "@tauri-apps/plugin-clipboard-manager";

import "./index.scss";
import toast from "react-hot-toast";

const ClipList: React.FC = memo(() => {
  const [clips, idMap] = useClips();
  const setEditState = useContext(EditorContext);

  const handleClickClip = async (e: React.MouseEvent<HTMLDivElement>) => {
    const clickedCard = (e.target as HTMLElement).closest(".clipbox") as HTMLElement | null;
    if (!clickedCard) return;

    const clipId = Number(clickedCard.dataset.clipId);
    if (Number.isNaN(clipId)) return;

    const idx = idMap.get(clipId);
    if (typeof idx !== "number") return;

    console.log("Clicked clip:", clips[idx]);
    const clickedEdit = (e.target as HTMLElement).closest(".options .option") as HTMLElement | null;
    if (clickedEdit) {
      // to edit it
      setEditState({
        editing: true,
        clip: clips[idx],
      });
    } else {
      // to copy it
      await clipboardWriteText(clips[idx].content);
      toast.success("Copied!", { duration: 1000 });
    }
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
})

export default ClipList;