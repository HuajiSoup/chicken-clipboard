import { Settings, X } from "lucide-react";

import "./index.scss";
import { invoke } from "@tauri-apps/api/core";

const Header: React.FC = () => {
  const handleClose = () => {
    invoke("set_window_visibility", { visible: false });
  }

  return (
    <header className="header" data-tauri-drag-region>
      <span className="settings-btn" none-drag-region>
        <Settings size={25} strokeWidth={1.5} />
      </span>
      <span className="close-btn" none-drag-region onClick={handleClose}>
        <X size={25} strokeWidth={1.5} />
      </span>
    </header>
  );
}

export default Header;