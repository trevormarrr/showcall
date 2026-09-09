# ShowCall v2.6.1 Release Notes

## 🐛 What's Fixed in v2.6.1 — Timecode & Cue Stack Bug Fixes

This is a bug-fix release addressing two issues found while field-testing LTC timecode cue playback:

- **Timecode cues only fire on an exact hit.** If LTC starts running mid-timecode or skips past a cue's recorded mark (e.g. it starts at hour 1 minute 2 but a cue is set for hour 1), the cue stack no longer "catches up" by firing every cue up to the current time. A cue now only fires when the timecode reads within tolerance of its exact mark — if it's missed, it stays unfired.
- **Cue Stack builder no longer overwrites your work.** Adding multiple presets/cues in the "Manage Cues" builder could get silently reverted back to a single cue by a background sync that kept the popout deck in step with the main app. That background sync now pauses while the builder is open, so you can add as many cues as you want before saving.

## 📦 Download & Install

### macOS
Download `ShowCall-2.6.1.dmg` (Universal / Apple Silicon + Intel).

### Windows
Download `ShowCall-Setup-2.6.1.exe`.

### Linux
Download `ShowCall-2.6.1.AppImage`.

### Auto-Update
If you're on a recent release (v2.3.4+), ShowCall's updater will offer this update automatically.

## 🔗 Helpful Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation: https://github.com/trevormarrr/showcall#readme
- Report Issues: https://github.com/trevormarrr/showcall/issues

## ⬆️ Upgrading

Your presets, settings, and cue stacks are preserved. Import/export of banks is available for sharing setups.

---

Thanks for using ShowCall — if you run into any issues or have suggestions, open an issue and we'll help you out.
