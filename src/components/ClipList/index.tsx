import { memo, useContext, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import toast from "react-hot-toast";
import { List } from "react-window";
import { EditorContext } from "../../App";
import { debounce } from "../../utils/timer";
import useClips from "../../utils/useClips";
import ClipBox from "../ClipBox";

import "./index.scss";

const ClipList: React.FC = memo(() => {
  const [query, setQuery] = useState<string>("");
  const [clips, clipsFiltered, idMap] = useClips(query);
  const setEditState = useContext(EditorContext);

  const isSearching = query.trim().length !== 0;
  const clipsToShow = isSearching ? clipsFiltered : clips;

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
      invoke("write_clipboard", { content: clips[idx].content })
        .then(() => {
          toast.success("Copied!", { duration: 1000 });
        });
    }
  }

  const handleQueryChange = debounce((value: string) => {
    setQuery(value);
  }, 500);

  return (<>
    <div className="cliplist-wrapper">
      {/* <Tester /> */}
      <div className="search-bar">
        <input
          id="search-bar" 
          type="text" 
          autoComplete="off"
          spellCheck={false}
          placeholder={`Search in ${clips.length} clips...`}
          onChange={(e) => handleQueryChange(e.target.value)}
          defaultValue=""
        />
      </div>
      <List 
        className="cliplist"
        onClick={handleClickClip}
        rowComponent={ClipBox}
        rowProps={{ clips: clipsToShow }}
        rowCount={clipsToShow.length}
        rowHeight={65}
      />
    </div>
  </>);
})

export default ClipList;