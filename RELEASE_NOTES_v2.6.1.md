# ShowCall v2.6.1 - Release Notes

**Release Date:** September 8, 2026

## 🎯 What's Fixed

### ⏱ Timecode cues no longer "catch up"
Previously, if LTC playback started mid-timecode or jumped past a cue's recorded mark (for example, a cue set for hour 1 but the timecode starts running at hour 1 minute 2), the armed cue stack would fire every cue up to the current time in rapid succession.

- Cues now only fire when the incoming timecode reads within tolerance of their exact recorded mark.
- If the timecode misses or skips over a cue's mark, that cue simply does not fire — no catch-up behavior.

### 🎭 Cue Stack builder no longer overwrites unsaved cues
The "Manage Cues" builder only let you add a single cue before it appeared to reset back to just the standby cue.

- Root cause: a background sync (2-second poll + SSE stream) that keeps the pop-out Preset Deck in step with the main app's cue stack was overwriting the in-memory, not-yet-saved cue stack while the builder modal was open.
- Background syncing now pauses while the builder is open and resumes once you save or close it, so you can add as many presets/custom cues as you need before saving.

## 📦 Installation

Download from [GitHub Releases](https://github.com/trevormarrr/showcall/releases/tag/v2.6.1)

- **macOS**: `ShowCall-2.6.1.dmg` (Intel + Apple Silicon)
- **Windows**: `ShowCall-Setup-2.6.1.exe`
- **Linux**: `ShowCall-2.6.1.AppImage` / `.deb`

### Auto-Update
If you're on a recent release (v2.3.4+), ShowCall's updater will offer this update automatically.

## ✅ What's Included

All v2.6.0 features plus:
- Exact-match timecode cue firing (no catch-up/skip-ahead)
- Fixed cue stack builder overwriting unsaved cues

## 🔗 Helpful Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation: https://github.com/trevormarrr/showcall#readme
- Report Issues: https://github.com/trevormarrr/showcall/issues
