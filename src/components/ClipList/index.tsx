import { useMemo } from "react";
import ClipBox, { Clip } from "../ClipBox";

import "./index.scss";

const testclips: Clip[] = [
  {
    id: 1,
    content: "Hello, World! Long text test!\
      Long text test!Long text test!\
      Long text test!Long text test!Long text test!Long text test!",
    timeEdited: 1085000000000,
  },
  {
    id: 2,
    content: "This is a test clip.",
    timeEdited: 1684444000000,
  }
];

const ClipList: React.FC = () => {
  const clipById = useMemo(() => {
    return new Map<number, Clip>(testclips.map((clip) => [clip.id, clip]));
  }, []);

  const handleClickClip = (e: React.MouseEvent<HTMLDivElement>) => {
    const clicked = (e.target as HTMLElement).closest(".clipbox") as HTMLElement | null;
    if (!clicked) return;

    const clipId = Number(clicked.dataset.clipId);
    if (Number.isNaN(clipId)) return;

    const selectedClip = clipById.get(clipId);
    if (!selectedClip) return;

    console.log("Clicked clip:", selectedClip);
  }

  return (<>
    <div className="cliplist-wrapper">
      <div className="cliplist" onClick={handleClickClip}>
        {testclips.map((clip) => (
          <ClipBox key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  </>);
}

export default ClipList;