# ShowCall v2.6.0 - Release Notes

**Release Date:** July 26, 2026

## 🎯 What's New

### ⏱ LTC Timecode Cue Playback
ShowCall can now follow SMPTE Linear Timecode (LTC) fed into an audio input to automatically fire your cue stack in sync with a click track, audio playback, or external timecode source.

- **Listen** to a selected audio input and decode LTC in real time (24, 25, 29.97, or 30 fps).
- **Arm** to auto-trigger the next cue when the incoming timecode reaches its recorded mark (with adjustable frame tolerance).
- **Record** / **Auto Record** to stamp the current timecode onto a cue as you run the show live.
- Live timecode readout, signal meter, and a "Next 3 Timecode Cues" preview list.
- Frame rate is configurable from Settings and persists across sessions.

### 🪟 Preset Deck Popout — Reliable GO Button
The pop-out Preset Deck's GO button is now fully wired up end-to-end:

- New `/api/cuestack/go` endpoint executes the next cue directly from the server, so the popout window doesn't need the main app's tab focused.
- New `/api/cuestack/stream` SSE channel pushes cue stack changes to the popout instantly, with polling as a fallback.
- The popout shows a clear "waiting for main app to sync" state instead of silently failing before the first sync.

### 🐛 Companion / Stream Deck Fixes
- Freshly connected Stream Deck / Companion clients now receive the **actually active** preset bank instead of the legacy `presets.json` file.
- Switching preset banks now immediately notifies connected Companion clients.
- Clearing a preset bank now immediately notifies connected Companion clients.
- Companion clients now get an independent 1-second status poll, so BPM/clip/connection feedback keeps working even when the ShowCall window is minimized.
- Fixed the composition parser always reporting `preview: null`; it now correctly detects Resolume's "Previewed" clip state.

## 📦 Installation

Download from [GitHub Releases](https://github.com/trevormarrr/showcall/releases/tag/v2.6.0)

- **macOS**: `ShowCall-2.6.0.dmg` (Intel + Apple Silicon)
- **Windows**: `ShowCall-Setup-2.6.0.exe`
- **Linux**: `ShowCall-2.6.0.AppImage` / `.deb`

### Auto-Update
If you're on a recent release (v2.3.4+), ShowCall's updater will offer this update automatically.

## ✅ What's Included

All v2.5.1 features plus:
- LTC Timecode listening, arming, recording, and auto-firing of cues
- Reliable popout deck GO button with server-side cue stack sync
- Companion/Stream Deck bank-sync and status-polling fixes

## 🔗 Helpful Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
