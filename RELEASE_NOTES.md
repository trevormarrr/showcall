# ShowCall v1.2.0 — Presets Editor, Update Check, and Settings Modal

This release focuses on customization and reliability. You can now edit presets in-app, change connection settings via a friendly modal, and quickly check for updates from GitHub.

## Highlights
- Presets Editor (🎛️ Presets): Edit labels, hotkeys, colors, and macro steps. Changes save to your user profile and apply immediately to the deck and hotkeys.
- Settings Modal (⚙️ Settings): Configure Resolume IP/ports and local server port. Saving persists to a user `.env` and restarts the embedded server to apply changes.
- Update Check (⬇️ Check Updates): Queries GitHub Releases and opens the latest installer for your platform. No extra dependencies required.

## Technical Changes
- Server converted to ESM (`server.mjs`) and unpacked in production for reliable startup in packaged/installed builds.
- Added endpoints:
  - `GET/POST /api/presets`
  - `GET/POST /api/settings`
  - `GET /api/update/check`
- UI: Layer labels fixed ("Layer N"), polished grid/deck visuals, improved notifications.

## Notes
- Ensure Resolume Preferences → Web Server is enabled (REST default 8080) and Preferences → OSC input is enabled (default 7000).
- User data (macOS): `~/Library/Application Support/ShowCall/`
  - `.env` — connection + server settings
  - `presets.json` — presets + quick cues
- Auto-update currently opens the browser to download the latest release; integrated, silent updates can be added later.

## Thanks
Thanks for all the testing and feedback! Please report issues and feature requests in GitHub Issues.
