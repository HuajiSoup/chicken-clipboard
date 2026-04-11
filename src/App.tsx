import { createContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Toaster } from "react-hot-toast";
import ClipEditor from "./components/ClipEditor";
import ClipList from "./components/ClipList";
import Header from "./components/Header";
import Clip from "./models/clip";

import "./App.scss";

// rust name style
type SettingsOptions = {
  quick_delete: boolean;
  autostart: boolean;
  show_tray: boolean;
};

type EditState = {
  editing: boolean;
  clip: Clip;
};

const defaultSettings: SettingsOptions = {
  quick_delete: true,
  autostart: false,
  show_tray: true,
};

const defaultEditState: EditState = {
  editing: false,
  clip: {
    id: -1,
    content: "You've found a easter egg placeholder!",
    edit: "2007-01-30 00:00:00",
  },
};

const SettingsContext = createContext<SettingsOptions>(defaultSettings);
const EditorContext = createContext<(state: EditState) => void>(() => {});

function App() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [settings, setSettings] = useState<SettingsOptions>(defaultSettings);
  const [editState, setEditState] = useState<EditState>(defaultEditState);

  useEffect(() => {
    invoke("read_settings")
      .then((options: unknown) => {
        setSettings(options as SettingsOptions);
      })
      .catch((error) => {
        console.error("Error reading settings:", error);
      })
      .finally(() => {
        setMounted(true);
      });
  }, []);

  return (<>
    <SettingsContext value={settings}>
      <main className="container">
        {mounted && (
          <EditorContext value={setEditState}>
            <Header />
            <ClipList />
            <ClipEditor editState={editState} />
          </EditorContext>
        )}
      </main>
      <Toaster position="top-center" />
    </SettingsContext>
  </>);
}

export default App;
export type { EditState, SettingsOptions };
export { EditorContext, SettingsContext };
