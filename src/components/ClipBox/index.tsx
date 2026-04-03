import { Trash2Icon } from "lucide-react";
import Clip from "../../models/clip";
import { RowComponentProps } from "react-window";

import "./index.scss";

const ClipBox = ({ 
  index,
  style,
  clips
}: RowComponentProps<{clips: Clip[]}>) => {
  const clip = clips[index];

  return (<>
    <div className="clipbox-wrapper"  style={style}>
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
    </div>
  </>);
}

export default ClipBox;