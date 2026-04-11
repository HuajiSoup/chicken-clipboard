import { useContext, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings, X } from "lucide-react";
import toast from "react-hot-toast";
import { SettingsContext, SettingsOptions } from "../../App";
import { throttle } from "../../utils/timer";

import "./index.scss";

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

const applySettingsForm = (options: SettingsOptions, form: HTMLFormElement) => {
  const elem = (elemName: string) => form.elements.namedItem(elemName) as HTMLInputElement;

  elem("quick-delete").checked = options.quick_delete;
  elem("autostart").checked = options.autostart;
  elem("show-tray").checked = options.show_tray;
}

const SettingsForm: React.FC = () => {
  const settings = useContext(SettingsContext);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (form) applySettingsForm(settings, form);
  }, [settings]);

  const saveSettings = throttle((e: React.SubmitEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const options: SettingsOptions = {
      quick_delete: formData.get("quick-delete") === "on",
      autostart: formData.get("autostart") === "on",
      show_tray: formData.get("show-tray") === "on",
    };

    invoke("write_settings", { options })
      .then(() => {
        toast.success("Settings saved, restart this app!", { duration: 1500 });
      });
  }, 2000);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveSettings(e);
  };

  const handleRestart = async () => {
    await invoke("restart_app");
  }

  return (<>
    <h2>Settings</h2>
    <small>*will take effect after <b>restart</b>.</small>
    <hr />

    <div className="form-wrapper">
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="input-box">
          <input type="checkbox" id="quick-delete" name="quick-delete" />
          <label htmlFor="quick-delete">Enable quick delete (Ctrl + Click)</label>
        </div>
        <div className="input-box">
          <input type="checkbox" id="autostart" name="autostart" />
          <label htmlFor="autostart">Start automatically</label>
        </div>
        <div className="input-box">
          <input type="checkbox" id="show-tray" name="show-tray" />
          <label htmlFor="show-tray">Show tray icon</label>
        </div>

        <p><i>More features coming soon...</i></p>
        <div className="input-box button-group">
          <button name="restart" type="button" onClick={handleRestart}>
            Restart
          </button>
          <button name="submit" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  </>);
}

export default Header;