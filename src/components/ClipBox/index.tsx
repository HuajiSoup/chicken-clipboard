import { Trash2Icon } from "lucide-react";
import Clip from "../../models/clip";
import "./index.scss";

const ClipBox: React.FC<{ clip: Clip }> = ({ clip }) => {
  return (<>
    <div className="clipbox" data-clip-id={clip.id}>
      <div className="content">
        <p>{clip.content}</p>
        <small>{clip.edit}</small>
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