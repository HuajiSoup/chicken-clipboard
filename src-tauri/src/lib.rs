use std::sync::Mutex;
use tauri::{path::BaseDirectory, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;

mod db;
mod listener;
mod settings;

#[derive(Default)]
pub struct AppState {
    pub app_dir: std::path::PathBuf,
    pub internal_copy: String,
}

#[tauri::command]
async fn set_window_visibility(visible: bool, app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    if visible {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    } else {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    println!("Closing window and exiting app...");
    if let Some(window) = app.get_webview_window("main") {
        if let Err(e) = window.close() {
            println!("Failed to close window, but will still exit: {}", e);
        }
    }
    app.exit(0);
    Ok(())
}

#[tauri::command]
async fn restart_app(app: tauri::AppHandle) -> Result<(), String> {
    println!("Closing window and restarting app...");
    if let Some(window) = app.get_webview_window("main") {
        if let Err(e) = window.close() {
            println!("Failed to close window, but will still restart: {}", e);
        }
    }
    app.restart()
}

#[tauri::command]
async fn read_settings(app: tauri::AppHandle) -> Result<settings::SettingsOptions, String> {
    settings::read_settings(&app)
}

#[tauri::command]
async fn write_settings(options: settings::SettingsOptions, app: tauri::AppHandle) -> Result<(), String> {
    settings::write_settings(options, &app)
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
async fn search_clips(app: tauri::AppHandle, query: String) -> Result<Vec<db::ClipRow>, String> {
    db::search_clips(&app, &query).await
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
async fn update_clip(id: i64, content: String, update_time: bool, app: tauri::AppHandle) -> Result<i64, String> {
    db::update_clip(&app, id, update_time, &content).await
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
    let mut state = state.lock().map_err(|e| e.to_string())?;
    state.internal_copy = db::hash_str(&content);
    println!("Internal copy, content: {}", content);

    app.clipboard()
        .write_text(&content)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_prevent_default::debug())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .app_name("Chicken Clipboard")
                .build(),
        )
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            // init state
            app.manage(Mutex::new(AppState {
                app_dir: app.path().resolve("", BaseDirectory::AppConfig).unwrap(),
                internal_copy: String::new(),
            }));
            // init db
            tauri::async_runtime::block_on(db::init_db(&app.handle().clone()))?;
            // start listeners
            settings::apply_settings(&app.handle().clone())?;
            settings::start_shortcut_listener(&app.handle().clone())?;
            listener::start_clipboard_listener(&app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_window_visibility,
            quit_app,
            restart_app,

            read_settings,
            write_settings,
            
            init_db,
            get_all_clips,
            search_clips,
            save_clip,
            delete_clip,
            clear_all_clips,
            update_clip,
            write_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
