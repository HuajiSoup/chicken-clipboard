// rust name style
type SettingsOptions = {
    update_time: boolean;
    quick_delete: boolean;
    autostart: boolean;
    show_tray: boolean;
};

const defaultSettings: SettingsOptions = {
    update_time: false,
    quick_delete: true,
    autostart: false,
    show_tray: true,
};

const readSettingsForm = (fd: FormData): SettingsOptions => {
    const settings: SettingsOptions = {
        update_time: fd.get("update-time") === "on",
        quick_delete: fd.get("quick-delete") === "on",
        
        autostart: fd.get("autostart") === "on",
        show_tray: fd.get("show-tray") === "on",
    };
    return settings;
}

const applySettingsForm = (options: SettingsOptions, form: HTMLFormElement) => {
    const elem = (elemName: string) => form.elements.namedItem(elemName) as HTMLInputElement;

    elem("update-time").checked = options.update_time;
    elem("quick-delete").checked = options.quick_delete;
    
    elem("autostart").checked = options.autostart;
    elem("show-tray").checked = options.show_tray;
}

export type { SettingsOptions };
export { defaultSettings, readSettingsForm, applySettingsForm };