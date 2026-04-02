use sqlx::{sqlite::SqliteQueryResult, Pool, Sqlite};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_sql::{DbInstances, DbPool};

#[derive(Debug, Clone, serde::Serialize, sqlx::FromRow)]
pub struct ClipRow {
    pub id: u64,
    pub content: String,
    pub edit: String,
}

pub const DB_URL: &str = "sqlite:E:/HuajiSoup/huajiLAB/messy/db/clips.db";

async fn sqlite_pool<R: Runtime>(handle: &AppHandle<R>) -> Result<Pool<Sqlite>, String> {
    let instances = handle.state::<DbInstances>();
    let lock = instances.0.read().await;
    let db = lock
        .get(DB_URL)
        .ok_or_else(|| format!(".DB file is not loaded: {DB_URL}"))?;

    match db {
        DbPool::Sqlite(pool) => Ok(pool.clone()),
    }
}

pub async fn init_db<R: Runtime>(handle: &AppHandle<R>) -> Result<(), String> {
    let db_pool = sqlite_pool(handle).await?;

    sqlx::query(
        "
        CREATE TABLE IF NOT EXISTS clips (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            content     TEXT NOT NULL,
            hash        TEXT UNIQUE NOT NULL,
            edit        TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ",
    )
    .execute(&db_pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn get_all_clips<R: Runtime>(
    handle: &AppHandle<R>,
) -> Result<Vec<ClipRow>, String> {
    let db_pool = sqlite_pool(handle).await?;

    let rows = sqlx::query_as::<_, ClipRow>(
        "SELECT id, content, edit FROM clips ORDER BY edit DESC",
    )
    .fetch_all(&db_pool)
    .await
    .map_err(|e| e.to_string())?;

    println!("Fetched! Results:");
    for clip in &rows {
        println!("ID: {}, Content: {}, Edit: {}", clip.id, clip.content, clip.edit);
    }

    Ok(rows)
}

pub async fn save_clip<R: Runtime>(
    handle: &AppHandle<R>,
    content: &str,
) -> Result<SqliteQueryResult, String> {
    let db_pool = sqlite_pool(handle).await?;

    let hash = hash_str(content);
    sqlx::query(
        "INSERT INTO clips (content, hash) VALUES (?, ?) 
        ON CONFLICT(hash) DO UPDATE SET content = excluded.content, edit = datetime('now', 'localtime')",
    )
    .bind(content)
    .bind(hash)
    .execute(&db_pool)
    .await
    .map_err(|e| e.to_string())
}

pub async fn delete_clip<R: Runtime>(
    handle: &AppHandle<R>,
    id: i64,
) -> Result<SqliteQueryResult, String> {
    let db_pool = sqlite_pool(handle).await?;

    sqlx::query("DELETE FROM clips WHERE id = ?")
        .bind(id)
        .execute(&db_pool)
        .await
        .map_err(|e| e.to_string())
}

pub async fn clear_all_clips<R: Runtime>(
    handle: &AppHandle<R>,
) -> Result<SqliteQueryResult, String> {
    let db_pool = sqlite_pool(handle).await?;

    sqlx::query("DELETE FROM clips")
        .execute(&db_pool)
        .await
        .map_err(|e| e.to_string())
}

pub async fn update_clip_content<R: Runtime>(
    handle: &AppHandle<R>,
    id: i64,
    content: &str,
) -> Result<SqliteQueryResult, String> {
    let db_pool = sqlite_pool(handle).await?;

    let new_hash = hash_str(content);
    sqlx::query(
        "UPDATE clips SET content = ?, hash = ?, edit = datetime('now', 'localtime') WHERE id = ?",
    )
    .bind(content)
    .bind(new_hash)
    .bind(id)
    .execute(&db_pool)
    .await
    .map_err(|e| e.to_string())
}

fn hash_str(content: &str) -> String {
    use sha2::{Digest, Sha256};

    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}
