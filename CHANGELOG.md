# Changelog

All notable changes to ShowCall will be documented in this file.

## [2.1.0] - 2026-02-07

### Added
- **🎛️ Visual Preset Editor**: Complete redesign of preset management interface
  - Intuitive visual interface replacing raw JSON editing
  - List view showing all presets with color, hotkey, and step count
  - Drag-and-drop macro step builder with live preview
  - In-line step editing with validation
  - Duplicate preset functionality for quick variations
  - Add/edit/delete presets without touching JSON
  - Professional form-based workflow with real-time feedback
  - Visual macro step display with icons and formatted parameters
  - Safe preset deletion with confirmation

### Enhanced
- **User Experience**: Operators can now manage presets without technical knowledge
- **Preset Creation**: Step-by-step visual builder makes complex macros simple
- **Error Prevention**: Form validation prevents invalid preset configurations

### Technical
- Migrated from textarea JSON editor to structured form interface
- Added comprehensive CSS styling for preset editor components
- Implemented state management for preset editing workflow
- Enhanced preset save/load with proper validation

## [2.0.0] - 2025-01-XX

### Major Release
- **Version 2.0**: Comprehensive feature set and stability improvements
- Enhanced UI/UX with refined controls and visual feedback
- Production-ready Stream Deck integration via Companion module
- Robust OSC + REST API integration with Resolume Arena
- Professional-grade macro system with customizable presets
- Real-time composition monitoring and status updates
- Pop-out deck window for flexible control layouts

### Architecture
- Electron-based desktop application for cross-platform support
- Express server with WebSocket and SSE for real-time updates
- Modern vanilla JavaScript UI with no framework dependencies
- Comprehensive error handling and connection recovery

## [1.5.0] - 2025-10-07

### Added
- **🎛️ Stream Deck Integration via Companion Module**: Professional Stream Deck control
  - WebSocket server on `/api/companion` endpoint for real-time communication
  - Complete Companion module (`showcall-companion`) available on GitHub
  - Full action support: trigger clips/columns, cut to program, clear all, execute macros
  - Real-time visual feedback showing active clips and connection status
  - Comprehensive preset library with 32+ ready-to-use Stream Deck buttons
  - Live status variables: BPM, clip count, clip names, connection status
  - Professional integration tested with Stream Deck Studio, XL, and Companion/Bitfocus

### Enhanced
- **WebSocket Protocol**: Modern real-time communication architecture
- **Server Startup**: Enhanced console output showing all integration endpoints
- **Production Ready**: Full professional deployment with GitHub repositories

### Technical
- Added `ws` WebSocket dependency for real-time communication
- Companion client tracking and automatic status broadcasting
- Command validation and error handling for WebSocket messages
- Cross-platform compatibility for Stream Deck setups

## [1.3.1] - 2025-10-06

### Improved
- **Enhanced Pop-out Deck Design**: Complete visual overhaul to match main UI
  - Modern card-based design with CSS variables and consistent styling
  - Proper color dots matching preset colors from configuration
  - Loading states with spinner animation and better error handling
  - Success flash animation on button press for visual feedback
  - Fixed data loading to use `/api/presets` endpoint (same as main app)
  - Improved typography, spacing, and hover/active states
  - Better responsive layout optimized for 300px width
  - Enhanced console logging for debugging

### Fixed
- Pop-out deck now loads actual preset names and colors instead of placeholder [1], [2], [3]
- Removed loading spinner issue that persisted indefinitely
- Proper keyboard shortcut handling in deck window

## [1.3.0] - 2025-10-04

### Added
- **Pop-out Preset Deck Window**: New floating window for preset buttons that stays always-on-top
  - Access via "🪟 Pop-out Deck" button in the main UI header
  - Compact 300x600px window optimized for quick preset access
  - Fully functional preset buttons with keyboard shortcuts
  - Always-on-top behavior for use alongside other applications (like ProPresenter)
  - Fallback to new browser tab when running in web mode
- IPC communication system for Electron main/renderer process coordination
- Dedicated deck.html page with responsive preset button layout

### Technical Changes
- Added `electron/preload.js` for secure IPC communication
- Extended `electron/main.cjs` with `createDeckWindow()` function and IPC handlers
- Enhanced main window with preload script for deck window communication
- New deck UI with hover effects, keyboard shortcut indicators, and visual feedback

## [1.2.2] - 2025-10-04

### Added
- Enhanced active clip highlighting system that shows ALL active clips in a column (not just the top layer)
- Right-click foundation for future preview functionality
- Improved notification stacking with proper vertical spacing

### Changed
- Removed individual "PROG" text badges from clips for cleaner UI - now uses border highlighting only
- Removed layer label highlighting on left side (columns-only highlighting approach)
- Multi-clip detection via programClips array to handle multiple layers active in same column
- Stronger CSS borders and glow effects for better visibility

### Fixed
- Visual feedback issue where only the top layer showed as active when multiple layers in the same column were live
- Notification overlap and stacking problems in top-right corner

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

## [1.2.1] - 2025-10-04

### Added
- Live Indicators panel showing current Program and Preview clip with layer + column badges.
- Column-wide and layer label contextual highlighting for active Program and Preview clips.
- Subtle sibling column highlighting to improve spatial awareness without overwhelming contrast.

### Changed
- Grid status update now unifies highlight clearing and applies consistent CSS classes.

### Notes
- No server/API changes; purely frontend enhancements (safe upgrade). If custom CSS overrides existed, verify new classes: `active-col-highlight`, `active-layer-highlight`, `col-sibling-prog`, `col-sibling-prev`.

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
