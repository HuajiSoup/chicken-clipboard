import { useContext, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { EditorContext, EditState } from "../../App";

import "./index.scss";

type ClipEditorProps = {
  editState: EditState;
};

const ClipEditor: React.FC<ClipEditorProps> = ({ editState }) => {
  const { editing, clip } = editState;
  const { id, content } = clip;
  const setEditState = useContext(EditorContext);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      if (textareaRef.current?.value) textareaRef.current.value = content;
    }
  });

  const handleReturn = () => {
    setEditState({
      editing: false,
      clip: clip, // keep content for animation
    });
  }

  const handleDelete = () => {
    invoke("delete_clip", { id })
      .then(() => {
        handleReturn();
        toast.success("Deleted!", { duration: 1000 });
      });
  }

  const handleSave = () => {
    const newContent = textareaRef.current?.value;
    if (!newContent) return;

    invoke("update_clip", { id, content: newContent })
      .then(() => {
        handleReturn();
        toast.success("Saved!", { duration: 1000 });
      });
  }

  return (<>
    <div className={`clip-editor ${editing ? 'open' : 'close'}`}>
      <div className="btn return" onClick={handleReturn}>
        <X size={25} strokeWidth={1.5} />
      </div>

      <h2>View & Edit</h2>

      <textarea name="content" ref={textareaRef} placeholder="Clip content here...">{content}</textarea>

      <div className="options">
        <div className="btn delete" id="btn-delete" onClick={handleDelete}>
          <Trash2 size={25} strokeWidth={1.5} />
        </div>
        <div className="btn save" id="btn-save" onClick={handleSave}>
          <Save size={25} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  </>);
}

export default ClipEditor;
