import { useContext } from "react";
import { EditorContext, EditState } from "../../App";

import "./index.scss";

type ClipEditorProps = {
  editState: EditState;
};

const ClipEditor: React.FC<ClipEditorProps> = ({ editState }) => {
  if (!editState.editing || !editState.clip) return null;
  const { id, content } = editState.clip;
  const setEditState = useContext(EditorContext);

  return (<>
    <div className="clip-editor" onClick={() => {
      setEditState({
        editing: false,
        clip: null,
      });
    }}>
      <h2>Editing Clip #{id}</h2>
      <p>{content}</p>
    </div>
  </>);
}

export default ClipEditor;
