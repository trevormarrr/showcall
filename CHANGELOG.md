# Changelog

All notable changes to ShowCall will be documented in this file.

## [1.2.0] - 2025-10-02

### Added
- Presets editor (UI → Presets) allowing editing of preset labels, hotkeys, colors, and macro steps. Saved to user profile as `presets.json`.
- Settings modal (UI → Settings) to change Resolume IP/ports and ShowCall server port. Saving persists to user `.env` and restarts the server.
- Update check button (Quick Actions) that queries GitHub Releases and opens the latest installer for your platform.
- New server endpoints:
	- `GET/POST /api/presets` for presets persistence.
	- `GET/POST /api/settings` for configuration.
	- `GET /api/update/check` for latest release/asset URLs.

### Changed
- Server converted to ESM module (`server.mjs`) and unpacked for production to ensure reliable startup inside packaged apps.
- Improved UI grid and labels (Layers shown as “Layer N”), visual polish for deck and quick cues.

### Fixed
- Packaged app startup reliability across dist vs installed contexts (robust path resolution and spawn env).
- Better error handling/logging for OSC/REST operations.

### Notes
- Ensure Resolume REST API and OSC input are enabled (default ports 8080 and 7000).
- On first run, user settings are created under the platform user data directory (macOS: `~/Library/Application Support/ShowCall`).
- Auto‑update currently opens the latest release asset in your browser; seamless in‑app updates may be added later.

---

## [1.0.0] - 2025-10-01

### 🎉 Initial Release

#### Features
- **OSC Control Protocol** - Fast, reliable clip triggering via UDP
- **REST API Monitoring** - Real-time composition status and structure
- **Auto-Discovery** - Automatically reads composition structure from Resolume
- **Smart Grid Display** - Dynamic grid with 5×8 default view and expand controls
- **Layer Stacking** - Proper layer ordering (Layer 1 at bottom)
- **Preset Macros** - Multi-step sequences with keyboard shortcuts
- **Real-time Status** - Program/preview display with BPM monitoring
- **Connection Health** - Visual indicators for REST and OSC connectivity
- **Empty Cell Filtering** - Clean UI with automatic filtering of invalid clips

#### Technical
- Hybrid architecture: OSC for control + REST for monitoring
- 1-based indexing matching Resolume UI
- Server-Sent Events for real-time updates
- Fire-and-forget OSC for <1ms latency
- Automatic reconnection handling
- Mock mode for testing without Resolume

#### UI/UX
- Dark theme matching Resolume aesthetic
- Responsive grid with expand/collapse
- Visual feedback for active clips
- Notification system for user actions
- Keyboard shortcut support

#### Platforms
- macOS (Intel & Apple Silicon)
- Windows (x64)
- Linux (AppImage, deb)

### Known Issues
- First connection may take 2-3 seconds to populate grid
- Large compositions (>50 columns) may have slower initial load

---

## Roadmap

### v1.1.0 (Planned)
- [ ] Persistent grid view preferences
- [ ] Custom color themes
- [ ] Clip thumbnails/previews
- [ ] Layer solo/mute controls
- [ ] BPM tap tempo
- [ ] Composition switching
- [ ] Multi-instance support

### v1.2.0 (Planned)
- [ ] MIDI controller mapping
- [ ] Custom layouts/views
- [ ] Clip recording/playback
- [ ] Effect control integration
- [ ] Layer opacity controls

### Future Considerations
- Mobile app version (iOS/Android)
- Web-based version (no Electron)
- Plugin system for extensions
- Cloud preset sync
