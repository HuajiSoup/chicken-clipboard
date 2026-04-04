import React, { createContext, useState } from "react";
import Header from "./components/Header";
import ClipList from "./components/ClipList";
import ClipEditor from "./components/ClipEditor";
import Clip from "./models/clip";

import "./App.scss";
import { Toaster } from "react-hot-toast";

type EditState = {
  editing: boolean;
  clip: Clip | null;
};

const EditorContext = createContext<(state: EditState) => void>(() => {});

function App() {
  const [editState, setEditState] = useState<EditState>({
    editing: false,
    clip: null,
  });

  return (<>
    <main className="container">
      <EditorContext value={(state) => {
        console.log("Edit state changed:", state);
        setEditState(state);
      }}>
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
