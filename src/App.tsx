import { createContext, useState } from "react";
import Header from "./components/Header";
import ClipList from "./components/ClipList";
import ClipEditor from "./components/ClipEditor";
import Clip from "./models/clip";

import "./App.scss";
import { Toaster } from "react-hot-toast";

type EditState = {
  editing: boolean;
  clip: Clip;
};

const EditorContext = createContext<(state: EditState) => void>(() => {});

function App() {
  const [editState, setEditState] = useState<EditState>({
    editing: false,
    clip: {
      id: -1,
      content: "You've found a easter egg placeholder!",
      edit: "2007-01-30 00:00:00",
    },
  });

  return (<>
    <main className="container">
      <EditorContext value={setEditState}>
        <Header />
        <ClipList />
        <ClipEditor editState={editState} />
      </EditorContext>
    </main>
    <Toaster position="top-center" />
  </>);
}

export default App;
export type { EditState };
export { EditorContext };
