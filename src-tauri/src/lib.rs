mod db;
mod listener;

#[tauri::command]
async fn init_db(app: tauri::AppHandle) -> Result<(), String> {
    db::init_db(&app).await
}

#[tauri::command]
async fn get_all_clips(app: tauri::AppHandle) -> Result<Vec<db::ClipRow>, String> {
    db::get_all_clips(&app).await
}

#[tauri::command]
async fn save_clip(content: String, app: tauri::AppHandle) -> Result<u64, String> {
    db::save_clip(&app, &content)
        .await
        .map(|result| result.rows_affected())
}

#[tauri::command]
async fn delete_clip(id: i64, app: tauri::AppHandle) -> Result<u64, String> {
    db::delete_clip(&app, id)
        .await
        .map(|result| result.rows_affected())
}

#[tauri::command]
async fn clear_all_clips(app: tauri::AppHandle) -> Result<u64, String> {
    db::clear_all_clips(&app)
        .await
        .map(|result| result.rows_affected())
}

#[tauri::command]
async fn update_clip(id: i64, content: String, app: tauri::AppHandle) -> Result<u64, String> {
    db::update_clip_content(&app, id, &content)
        .await
        .map(|result| result.rows_affected())
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
            tauri::async_runtime::block_on(db::init_db(&app.handle().clone()))?;
            Ok(())
        })
        .setup(|app| {
            listener::start_clipboard_listener(&app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            init_db,
            get_all_clips,
            save_clip,
            delete_clip,
            clear_all_clips,
            update_clip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
