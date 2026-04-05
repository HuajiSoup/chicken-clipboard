use std::sync::Mutex;

use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_clipboard_manager::ClipboardExt;
use crate::{db, AppState};

const LISTEN_INTERVAL: u64 = 1500; // ms

pub fn start_clipboard_listener<R: Runtime>(app_handle: &AppHandle<R>) {
    let handle = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        const DB_URL: &str = db::DB_URL;
        println!("Starting clipboard listener at DB URL: {}", DB_URL);

        let mut last_hash = String::new();
        loop {
            tokio::time::sleep(std::time::Duration::from_millis(LISTEN_INTERVAL)).await;
            if let Ok(cur) = handle.clipboard().read_text() {
                let cur_hash = db::hash_str(&cur);
                
                let skip = {
                    let state = handle.state::<Mutex<AppState>>();
                    let mut state = state.lock().unwrap();
                    
                    // deny, if it's the same as last one,
                    // or it's from internal app.
                    if cur_hash == last_hash {
                        true
                    } else if cur_hash == state.internal_copy {
                        true
                    } else {
                        last_hash = cur_hash;
                        state.internal_copy.clear();
                        false
                    }
                };

                if skip { continue; }

                let _ = db::save_clip(&handle, &cur)
                    .await
                    .map(|saved| {
                        println!("saved clip from listener with id: {}, content: {}", saved.id, saved.content);
                    })
                    .map_err(|e| e.to_string());
            }
        }
    });
}