use std::{sync::Mutex};
use tauri::Manager;
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::db::hash_str;

mod db;
mod listener;

#[derive(Default)]
pub struct AppState {
    pub internal_copy: String,
}

#[tauri::command]
async fn init_db(app: tauri::AppHandle) -> Result<(), String> {
    db::init_db(&app).await
}

#[tauri::command]
async fn get_all_clips(app: tauri::AppHandle) -> Result<Vec<db::ClipRow>, String> {
    db::get_all_clips(&app).await
}

#[tauri::command]
async fn save_clip(content: String, app: tauri::AppHandle) -> Result<db::ClipRow, String> {
    db::save_clip(&app, &content).await
}

#[tauri::command]
async fn delete_clip(id: i64, app: tauri::AppHandle) -> Result<i64, String> {
    db::delete_clip(&app, id).await
}

#[tauri::command]
async fn update_clip(id: i64, content: String, app: tauri::AppHandle) -> Result<i64, String> {
    db::update_clip(&app, id, &content).await
}

#[tauri::command]
async fn clear_all_clips(app: tauri::AppHandle) -> Result<u64, String> {
    db::clear_all_clips(&app)
        .await
        .map(|result| result.rows_affected())
}

#[tauri::command]
async fn write_clipboard(content: String, app: tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();
    state.internal_copy = hash_str(&content);
    println!("Updated internal copy to:{}, hash={}", &content, state.internal_copy);

    app.clipboard()
        .write_text(&content)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(
            tauri_plugin_clipboard_manager::init()
        )
        .plugin(
            tauri_plugin_sql::Builder::new().build()
        )
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));
            tauri::async_runtime::block_on(db::init_db(&app.handle().clone()))?;
            listener::start_clipboard_listener(&app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            init_db,
            get_all_clips,
            save_clip,
            delete_clip,
            clear_all_clips,
            update_clip,
            write_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
