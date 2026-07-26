# ShowCall v2.6.0 Release Notes

## ⏱ What's New in v2.6.0 — Timecode Cue Playback

ShowCall now supports SMPTE Linear Timecode (LTC) as a way to drive your cue stack automatically, alongside the manual GO button.

Why you'll love it:

- Listen to any audio input for LTC and see live timecode on screen.
- Arm the cue stack so cues fire automatically when the incoming timecode reaches their recorded mark.
- Record timecode onto cues live as you run the show, or use Auto Record to capture it every time you GO.
- Preview the next 3 upcoming timecode cues at a glance.

Other improvements in this release:

- The pop-out Preset Deck's GO button now works reliably from a real server-side cue stack sync, with instant updates via SSE.
- Stream Deck / Companion integration fixes: correct active bank sync on connect, instant bank-switch/clear notifications, and independent status polling so feedback never goes stale while the window is minimized.
- Fixed a long-standing bug where the "preview" clip was never reported to the UI.

## 📦 Download & Install

### macOS
Download `ShowCall-2.6.0.dmg` (Universal / Apple Silicon + Intel).

### Windows
Download `ShowCall-Setup-2.6.0.exe`.

### Linux
Download `ShowCall-2.6.0.AppImage`.

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
