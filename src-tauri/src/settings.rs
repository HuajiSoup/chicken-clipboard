use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_store::StoreExt;

const SETTINGS_FILE: &str = "settings.json";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SettingsOptions {
    pub update_time: bool,
    pub quick_delete: bool,
    pub autostart: bool,
    pub show_tray: bool,
}

pub fn write_settings<R: Runtime>(options: SettingsOptions, app: &AppHandle<R>) -> Result<(), String> {
    let store = app.store(SETTINGS_FILE).map_err(|e| e.to_string())?;

    store.set("update_time", serde_json::json!({ "value": options.update_time }));
    store.set("quick_delete", serde_json::json!({ "value": options.quick_delete }));
    store.set("autostart", serde_json::json!({ "value": options.autostart }));
    store.set("show_tray", serde_json::json!({ "value": options.show_tray }));

    Ok(())
}

pub fn read_settings<R: Runtime>(app: &AppHandle<R>) -> Result<SettingsOptions, String> {
    let store = app.store(SETTINGS_FILE).map_err(|e| e.to_string())?;

    let update_time = match store.get("update_time") {
        Some(value) => value["value"].as_bool().unwrap_or(false),
        None => false,
    };
    let quick_delete = match store.get("quick_delete") {
        Some(value) => value["value"].as_bool().unwrap_or(true),
        None => true,
    };
    let autostart = match store.get("autostart") {
        Some(value) => value["value"].as_bool().unwrap_or(false),
        None => false,
    };
    let show_tray = match store.get("show_tray") {
        Some(value) => value["value"].as_bool().unwrap_or(true),
        None => true,
    };

    Ok(SettingsOptions { update_time, autostart, show_tray, quick_delete })
}

pub fn apply_settings<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let options = read_settings(app)?;

    // autostart
    let autostart_manager = app.autolaunch();
    let autostart_enbaled = autostart_manager.is_enabled().unwrap_or(false);

    if autostart_enbaled != options.autostart {
        if options.autostart {
            if cfg!(dev) {
                println!("autostart enabled!");
            } else {
                let _ = autostart_manager.enable();
            }
        } else {
            if cfg!(dev) {
                println!("autostart disabled!");
            } else {
                let _ = autostart_manager.disable();
            }
        }
    }

    // tray
    if options.show_tray {
        enable_tray(app)?;
    }

    Ok(())
}

pub fn enable_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    use tauri::{
        menu::{MenuItem, MenuBuilder},
        tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    };

    let show_i =
        MenuItem::with_id(app, "show", "Show Window", true, None::<&str>).map_err(|e| e.to_string())?;
    let hide_i =
        MenuItem::with_id(app, "hide", "Hide Window", true, None::<&str>).map_err(|e| e.to_string())?;
    let quit_i =
        MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).map_err(|e| e.to_string())?;

    let tray_menu = MenuBuilder::new(app)
        .item(&show_i)
        .item(&hide_i)
        .separator()
        .item(&quit_i)
        .build()
        .map_err(|e| e.to_string())?;

    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or_else(|| "default window icon is missing".to_string())?;

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .show_menu_on_left_click(false)
        .menu(&tray_menu)
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            },
            _ => {}
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            },
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            },
            "quit" => {
                println!("Closing window and exiting app...");
                if let Some(window) = app.get_webview_window("main") {
                    if let Err(e) = window.close() {
                        println!("Failed to close window, but will still exit: {}", e);
                    }
                }
                app.exit(0);
            },
            _ => {
                println!("Unknown tray menu event: {:?}", event.id);
            }
        })
        .build(app)
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn start_shortcut_listener<R: Runtime>(app_handle: &AppHandle<R>) -> Result<(), String> {
    use tauri::Manager;
    use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

    let handle = app_handle.clone();
    handle
        .plugin(
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
    Ok(())
}
