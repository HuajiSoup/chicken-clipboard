# Chicken Clipboard

![logo](./app-icon.png)

**Chipboard!**

## What is this?

It's a light-weight clipboard. It's developed because Windows does not have a nice clipboard to use.

*Notice*: I developed it **only on Windows** so by now I only released Windows version.

## Based on?

- **Tauri**
- Frontend: **React** (Typescript)
- Backend: **Rust**
- Use **SQLite** to save information

## Usage

By default, when it's running, you can press `Alt + C` to call it, then it will listen to your system clipboard and try to sync with it.

By now it only saves clips in text, images cannot be saved.

By now there isn't many things to say, it's too simple.

## Storage

All related files will be saved in `%APPDATA%/top.huaji-universe.chicken-clipboard`, in detail:

- `clips.db` clip database
- `settings.json` user settings
