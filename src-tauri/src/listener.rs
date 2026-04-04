use tauri::{AppHandle, Runtime};
use tauri_plugin_clipboard_manager::{ClipboardExt};
use crate::db;

pub fn start_clipboard_listener<R: Runtime>(app_handle: &AppHandle<R>) {
    let handle = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        let url = db::DB_URL;
        println!("Starting clipboard listener at DB URL: {}", url);

        let mut last_hash = String::new();
        loop {
            tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
            if let Ok(cur) = handle.clipboard().read_text() {
                let cur_hash = db::hash_str(&cur);
                if cur_hash == last_hash {
                    continue;
                }

                last_hash = cur_hash;
                let result = db::save_clip(&handle, &cur).await;

                match result {
                    Ok(saved) => {
                        println!("Saved new clipboard content: {} (id: {}, edit: {})", cur, saved.id, saved.edit)
                    },
                    Err(e) => eprintln!("Failed to save clipboard content: {}", e),
                }
            }
        }
    });
}