import { Trash2Icon } from "lucide-react";
import "./index.scss";

type Clip = {
  id: number;
  content: string;
  timeEdited: number;
}

const ClipBox: React.FC<{ clip: Clip }> = ({ clip }) => {
  return (<>
    <div className="clipbox" data-clip-id={clip.id}>
      <div className="content">
        <p>{clip.content}</p>
        <small>{new Date(clip.timeEdited).toLocaleString()}</small>
      </div>
      <div className="options">
        <div className="option delete">
          <Trash2Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  </>);
}

export default ClipBox;
export type { Clip };