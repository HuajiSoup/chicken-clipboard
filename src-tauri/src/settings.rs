use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_store::StoreExt;

const SETTINGS_FILE: &str = "settings.json";

pub fn read_settings<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let store = app.store(SETTINGS_FILE).map_err(|e| e.to_string())?;

    let set_autostart = match store.get("autostart") {
        Some(value) => value["value"].as_bool().unwrap_or(false),
        None => false,
    };
    let autostart_manager = app.autolaunch();
    let autostart_enbaled = autostart_manager.is_enabled().unwrap_or(false);

    if autostart_enbaled != set_autostart {
        if set_autostart {
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

    let set_show_tray = match store.get("show_tray") {
        Some(value) => value["value"].as_bool().unwrap_or(true),
        None => true,
    };
    if set_show_tray {
        enable_tray(app)?;
    }

    Ok(())
}

pub fn enable_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    use tauri::{
        menu::{Menu, MenuItem},
        tray::TrayIconBuilder,
    };

    let show_i =
        MenuItem::with_id(app, "show", "Show Window", true, None::<&str>).map_err(|e| e.to_string())?;
    let hide_i =
        MenuItem::with_id(app, "hide", "Hide Window", true, None::<&str>).map_err(|e| e.to_string())?;
    let quit_i =
        MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).map_err(|e| e.to_string())?;

    let tray_menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i]).map_err(|e| e.to_string())?;

    let icon = app
        .default_window_icon()
        .cloned()
        .ok_or_else(|| "default window icon is missing".to_string())?;

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .show_menu_on_left_click(false)
        .menu(&tray_menu)
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
                println!("Exiting app...");
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
