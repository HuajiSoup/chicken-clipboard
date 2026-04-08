import { Settings, X } from "lucide-react";

import "./index.scss";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

const Header: React.FC = () => {
  const [openSettings, setOpenSettings] = useState<boolean>(false);

  const handleSettings = () => {
    setOpenSettings((prev) => !prev);
  };
  const handleClose = () => {
    invoke("set_window_visibility", { visible: false });
  }

  return (<>
    <header className="header">
      <div className="title-bar" data-tauri-drag-region>
        <span className="settings-btn" none-drag-region onClick={handleSettings}>
          <Settings size={25} strokeWidth={1.5} />
        </span>
        <span className="close-btn" none-drag-region onClick={handleClose}>
          <X size={25} strokeWidth={1.5} />
        </span>
      </div>

      <div className={`settings-panel ${openSettings ? 'open' : 'closed'}`}>
        <SettingsForm />
      </div>
    </header>
  </>);
}

const SettingsForm: React.FC = () => {
  return (<>
    <h2>Settings</h2>
    <hr />

    <div className="form-wrapper">
      <form>
        <div className="input-box">
          <input type="checkbox" id="autostart" name="autostart" />
          <label htmlFor="autostart">Start automatically</label>
        </div>
        <div className="input-box">
          <input type="checkbox" id="show-tray" name="show-tray" />
          <label htmlFor="show-tray">Show tray icon</label>
        </div>
        <p><i>More features coming soon...</i></p>
      </form>
    </div>
  </>);
}

export default Header;