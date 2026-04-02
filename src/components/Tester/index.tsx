import { invoke } from "@tauri-apps/api/core";

const Tester = () => {
  const handleSubmitAdd = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clipContent = formData.get("clipContent");
    console.log("Clip Content:", clipContent);
    invoke("save_clip", { content: clipContent })
      .then(() => console.log("Clip added successfully"))
      .catch((err) => console.error("Error adding clip:", err));
  }

  const handleSubmitUpdate = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clipId = Number(formData.get("clipId"));
    const clipContent = formData.get("clipContent");
    console.log("Clip ID:", clipId);
    console.log("Clip Content:", clipContent);
    invoke("update_clip", { id: clipId, content: clipContent })
      .then(() => console.log("Clip updated successfully"))
      .catch((err) => console.error("Error updating clip:", err));
  }

  return (<>
    <form onSubmit={handleSubmitAdd}>
      <textarea name="clipContent" placeholder="Clip content" />
      <button type="submit">Add</button>
    </form>
    <form onSubmit={handleSubmitUpdate}>
      <input type="number" name="clipId" id="clipId" />
      <textarea name="clipContent" placeholder="Clip content" />
      <button type="submit">Update</button>
    </form>
  </>);
}

export default Tester;