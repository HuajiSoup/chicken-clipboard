import Database from "@tauri-apps/plugin-sql";
import Clip from "../models/clip";

// export const db = await Database.load("sqlite:./clips.db");
export const db = await Database.load("sqlite:E:/HuajiSoup/huajiLAB/messy/db/clips.db");

export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clips (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      content     TEXT NOT NULL,
      hash        TEXT UNIQUE NOT NULL,
      edit        DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function getClips() {
  const clips = await db.select("SELECT * FROM clips ORDER BY edit DESC");
  return (clips as Clip[]);
}