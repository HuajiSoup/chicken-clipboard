import { Settings, X } from "lucide-react";

import "./index.scss";

const Header: React.FC = () => {
  return (
    <header className="header" data-tauri-drag-region>
      <span className="settings-btn" none-drag-region>
        <Settings size={25} strokeWidth={1.5} />
      </span>
      <span className="close-btn" none-drag-region>
        <X size={25} strokeWidth={1.5} />
      </span>
    </header>
  );
}

export default Header;