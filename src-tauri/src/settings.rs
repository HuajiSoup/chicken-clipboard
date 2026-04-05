use tauri::{AppHandle, Runtime};

pub fn start_shortcut_listener<R: Runtime>(
    app_handle: &AppHandle<R>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
        use tauri::Manager;

        let handle = app_handle.clone();
        handle.plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("alt+c")
                .map_err(|e| e.to_string())?
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::ALT, Code::KeyC) {
                            let Some(window) = app.get_webview_window("main") else {
                                return;
                            };

                            if window.is_visible().unwrap_or(false) {
                                if window.hide().is_err() {
                                    return;
                                }
                            } else {
                                if window.show().is_err() {
                                    return;
                                }
                                if window.set_focus().is_err() {
                                    return;
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}