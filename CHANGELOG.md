# Changelog

All notable changes to ShowCall will be documented in this file.

## [2.4.2] - 2026-02-25

### 🎨 UI Enhancements

- **Taller Cue Items**: Increased cue item height to 72px minimum (50% larger) for better readability
- **Enhanced Scrollbar**: Always-visible polished scrollbar with gradient effects and glow
- **Better Spacing**: Increased padding (18px/20px) and gaps (10px) throughout cue stack
- **Larger Elements**: 
  - Cue numbers increased to 40px (from 32px)
  - Font sizes increased across labels and details
  - Color dots increased to 12px (from 10px)
  - Side indicators increased to 5px (from 4px)
- **Improved Scrolling**: 
  - Container height expanded to 65vh with 350px minimum
  - Active cue auto-centers in viewport with smooth animation
  - Scrollbar width increased to 12px with enhanced styling
- **Visual Polish**: Better contrast, borders, and hover effects throughout

### Technical Details

- Updated `cuestack.css` scrollbar styling with gradients
- Modified `.cue-item` padding and minimum height
- Enhanced `.cue-number`, `.cue-label`, and `.cue-details` sizing
- Improved `scrollToCurrentCue()` function for better centering

## [2.4.1] - 2026-02-25

### 🐛 Fixes

- Fixed version display in UI header (now correctly shows v2.4.1)
- Updated all version references across documentation
- Synchronized package.json, README, and HTML version numbers

### Note

This is a minor patch release to fix version display inconsistencies. All features from v2.4.0 are included and working perfectly.

## [2.4.0] - 2026-02-25

### 🎭 NEW: Cue Stack System - Sequential Show Control

Professional theatrical-style cue stack for running shows cue by cue. Perfect for worship services, live events, and sequential programming.

**Core Features:**
- **0-based Theatrical Numbering**: Cue 0 (Standby), Cue 1, Cue 2... just like professional lighting consoles
- **Auto Standby Cue**: Every show automatically starts with Cue 0 as a pre-show standby position
- **Sequential Execution**: Press GO to advance through your show cue-by-cue
- **Visual State Indicators**:
  - 🟦 **Cyan glow**: Currently active/running cue
  - 🟨 **Yellow tint**: Next cue ready to execute
  - ⚫ **Faded/strikethrough**: Completed cues
- **Keyboard Shortcuts**:
  - `Space` = GO (advance to next cue)
  - `R` = Reset to standby position
  - `1-9` = Fire cues 0-8 directly
  - `0` = Fire cue 9 directly

**Cue Types:**
- **Preset Cues**: Add any existing preset to your cue stack
- **Custom Cues**: Build cues with visual action editor (trigger, triggerColumn, cut, clear, sleep)
- **Drag & Drop Reordering**: Easily rearrange cues in the management modal

**Management Features:**
- **Save/Load**: Cue stacks persist across sessions
- **Named Shows**: Give each cue stack a descriptive name
- **Progress Tracking**: Visual progress bar and status indicators
- **Jump to Cue**: Skip to any cue or execute specific cues directly
- **Missing Preset Detection**: Warnings for broken preset references

**Use Cases:**
- Sunday morning worship services
- Multi-song concerts
- Theatre shows with scene transitions
- Corporate presentations
- Any event requiring sequential control

### 🐛 Fixes

- Fixed cue stack visual state synchronization
- Improved preset ID validation and error messages
- Fixed currentIndex tracking for proper active cue display
- Removed redundant "Custom Cue" label from cue display

### 🔧 Technical

- Implemented theatrical cue index system (currentIndex = -1 for standby)
- Added backward compatibility for old saved cue stacks
- Enhanced logging for cue execution debugging
- Improved localStorage persistence for cue stack state

## [2.3.6] - 2026-02-24

### ✨ Improved

- **Horizontal Scrolling for Column Grid**: Added horizontal scroll bar to view all columns
  - Grid now scrolls horizontally when columns are expanded
  - Fixed issue where only half of columns were visible with many columns
  - Custom styled scrollbar with blue accent color matching UI theme
  - Fixed 120px column width when expanded for consistent scrolling
  - Smooth scrolling experience with mouse wheel and trackpad
  - Layer labels remain fixed on the left for easy reference

### 🔧 Technical

- Changed `#grid` overflow from `hidden` to `overflow-x: auto`
- Added custom scrollbar styling for webkit and Firefox browsers
- Updated grid template to use fixed widths when expanded
- Added `min-width: min-content` to grid container

### Note

This release focuses on improving the grid UI for compositions with many columns (20+). All features from v2.3.5 are included and working perfectly.

## [2.3.5] - 2026-02-16

### 🎯 Maintenance Release

- **Version Consistency**: Updated all version numbers across UI and documentation
  - Updated HTML interface version display to v2.3.5
  - Synchronized README.md with latest version references
  - Updated all documentation links to point to v2.3.5
  
- **Documentation Improvements**: 
  - Clarified auto-updater requirements in README
  - Enhanced release notes formatting
  - Updated quick reference links

### Technical

- All macOS builds continue to be signed and notarized
- Auto-updater working seamlessly from v2.3.4+
- GitHub Actions automatically signs all releases

### Note

This is a maintenance release to ensure version consistency across the application. All features from v2.3.4 are included:
- ✅ Full code signing and notarization
- ✅ Auto-updater functionality
- ✅ Stream Deck preset sync
- ✅ Real-time updates and visual feedback

## [2.3.4] - 2026-02-16

### 🔐 Security & Stability

- **Code Signing & Notarization**: All macOS builds are now properly signed and notarized with Apple
  - Eliminates "damaged" or "unverified developer" warnings on macOS
  - Passes Gatekeeper without user workarounds
  - Professional distribution ready for all users
  
- **Auto-Updater Fixed**: Resolved code signature validation issues
  - Properly signed updates enable seamless auto-updating
  - Users on v2.3.3 or earlier: Manual download of v2.3.4 required (one-time only)
  - All future updates (v2.3.5+) will auto-update seamlessly
  - No more "code signature validation failed" errors

### 📚 Documentation

- Added comprehensive code signing setup guides
- Added GitHub Actions signing configuration documentation
- Improved installation and security documentation

### 🔧 Technical

- Enabled `hardenedRuntime` for enhanced macOS security
- Configured notarization with Apple Developer credentials
- Updated GitHub Actions workflow for automatic signing
- Added entitlements for proper macOS app behavior

### ⚠️ Important Note for Existing Users

If you're updating from v2.3.2 or earlier, you must **manually download and install v2.3.4**. This is a one-time requirement due to the transition from unsigned to signed builds. After installing v2.3.4, all future updates will work automatically through the built-in updater.

## [2.3.3] - 2026-02-16

### Internal

- Initial code signing configuration (incomplete)
- Team ID integration for notarization

## [2.3.2] - 2026-02-15

### Fixed
- **🔄 Real-time Preset Sync**: Presets now update instantly on Stream Deck without restart
  - Fixed preset sync to trigger immediately when presets are saved
  - Added automatic `presets_updated` broadcast to all connected Companion clients
  - Buttons regenerate instantly when presets are created/modified (<100ms)
  - No more manual Companion restarts needed to see preset changes

- **✨ Active Preset Visual Feedback**: Buttons now show when executing
  - Stream Deck buttons flash bright orange when pressed
  - Added `preset_executing` broadcast during macro execution
  - 500ms visual feedback window for clear button press indication
  - Active state tracking with `activePresetId` variable
  - Enhances user experience with immediate visual confirmation

### Enhanced
- **🎛️ Companion Integration**: Enhanced WebSocket communication
  - Server broadcasts preset updates on save (not just on initial connection)
  - New `preset_executing` message type for real-time state updates
  - Automatic state clear after 500ms execution window
  - Better coordination between ShowCall and Companion module

### Technical
- Added `activePresetId` tracking in server state
- Enhanced `/api/presets` POST endpoint with broadcast functionality
- Improved `execute_macro` handler with execution state broadcasting
- Optimized WebSocket message flow for real-time updates

### Companion Module
- **Works with Companion v2.1.1+** for full real-time features
- Requires Companion module update to see active button feedback
- Backward compatible with v2.1.0 (preset sync only)

## [2.3.1] - 2026-02-15

### Fixed
- **🐛 Auto-Updater**: Fixed "marked is not defined" error when checking for updates
  - Removed dependency on `marked` library for parsing release notes
  - Release notes are now displayed directly as HTML from GitHub
  - Resolves console error when clicking "Check for Updates" button

## [2.3.0] - 2026-02-14

### Added
- **🎛️ Stream Deck Preset Sync**: Revolutionary automatic preset synchronization with Bitfocus Companion
  - Create presets in ShowCall → Instantly appear on Stream Deck
  - Edit presets → Stream Deck buttons update automatically in real-time
  - Delete presets → Buttons removed from Stream Deck automatically
  - Smart button styling with automatic color optimization for readability
  - Zero manual configuration required for Stream Deck buttons
  - Dynamic "ShowCall Presets" category in Companion
  - New `execute_preset` action in Companion module
  - WebSocket-based real-time synchronization (<100ms latency)
  - Comprehensive preset management UI in ShowCall

- **📡 Enhanced WebSocket Communication**:
  - Presets broadcast to all connected Companion clients on save
  - Automatic preset sync on Companion connection
  - `presets_updated` message type for real-time sync
  - Enhanced macro execution with user preset lookup priority

- **📚 Comprehensive Documentation**:
  - `PRESET_SYNC_GUIDE.md` - Complete user guide with setup, troubleshooting, and examples
  - `QUICK_REFERENCE.md` - One-page cheat sheet for rapid reference
  - `PRESET_INTEGRATION.md` (Companion) - Technical integration documentation
  - `IMPLEMENTATION_SUMMARY.md` - Complete technical implementation details
  - `test-preset-sync.sh` - Automated testing script with verification

### Enhanced
- **🔧 Companion Module v2.1.0**:
  - Dynamic preset button generation from ShowCall data
  - Automatic color parsing and text color optimization
  - Connection status feedback on all preset buttons
  - Enhanced logging for preset sync debugging
  - Improved error handling for preset execution

- **⚡ Preset System**:
  - Enhanced preset lookup (checks user presets first, then config.json)
  - Better error messages for preset execution failures
  - Improved preset validation and error handling
  - Support for real-time preset updates without restart

### Fixed
- **🐛 Preset Execution**: Fixed preset lookup to prioritize user-created presets
- **🔄 WebSocket Stability**: Improved connection handling for long-running sessions
- **📦 Module Packaging**: Updated Companion module build process for better compatibility

### Performance
- **🚀 Optimized Sync**: Minimal bandwidth usage (~1-5 KB per preset update)
- **⚡ Fast Updates**: Real-time synchronization in <100ms
- **💾 Efficient Storage**: JSON-based preset storage with minimal overhead

### Developer
- **🧪 Testing Infrastructure**: Added comprehensive test suite for preset sync
- **📖 API Documentation**: Complete WebSocket API reference for presets
- **🔧 Code Quality**: Enhanced error handling and logging throughout
- **♻️ Backward Compatibility**: Fully compatible with existing setups

### Documentation
- Added 6 comprehensive guides covering all aspects of preset sync
- Updated README with Stream Deck integration information
- Created quick reference guide for common workflows
- Added troubleshooting section with solutions for common issues

## [2.2.1] - 2026-02-07

### Fixed
- **🐛 Update Button Visibility**: Fixed duplicate `init()` function that was preventing the "Check Updates" button from appearing in the UI
- **🔧 DMG Build**: Fixed GitHub Actions build failures due to DMG creation issues
  - Added explicit `type: "file"` to DMG contents configuration
  - Removed problematic DMG format specification
  - Added `sign: false` and `writeUpdateInfo: true` for CI compatibility
  - Added DMG mount cleanup step in GitHub Actions workflow
  - Added debug logging for electron-builder
- **🔄 Auto-Updater Metadata**: Fixed missing `.yml` update metadata files in releases
  - Added `hardenedRuntime: false`, `gatekeeperAssess: false`, and `notarize: false` to mac config
  - Updated artifact uploads to include specific metadata files per platform
  - macOS: `latest-mac.yml`, Linux: `latest-linux.yml`, Windows: `latest.yml`
  - Prevents upload of debug/builder files that don't belong in releases
  - Ensures auto-updater can properly check for updates
- **📱 Version Display**: Updated UI to show correct v2.2.1 version number
- **Code Quality**: Removed duplicate button initialization code for cleaner implementation
- **UI Consistency**: Ensured update modal and button work correctly on first launch

### Technical
- Removed duplicate `init()` function at line 1244 that was overwriting the correct initialization
- Consolidated update button setup into single location within `setupUpdateNotifications()`
- Fixed electron-builder DMG configuration for GitHub Actions compatibility
- Added pre-build cleanup script to unmount stale DMG volumes
- Enhanced GitHub Actions to upload update metadata files
- Improved code maintainability and reduced potential for conflicts

## [2.2.0] - 2026-02-07

### Added
- **🔄 Enhanced Auto-Updater System**: Complete rebuild of update functionality
  - Beautiful modal UI with multiple views (checking, downloading, ready, error)
  - Real-time download progress bar with speed and size indicators
  - Release notes display directly in the app
  - Manual "Check for Updates" button with instant feedback
  - Update indicator badge in header showing status
  - Smart error handling with detailed error information
  - Install now or install later options
  - View full release notes on GitHub with one click
  - Automatic checks every 2 hours (production only)
  - electron-log integration for better debugging
  - Proper IPC communication between main and renderer
  - Silent background updates with non-intrusive notifications

### Enhanced
- **Update UX**: Complete visual overhaul of update system
- **Error Handling**: Comprehensive error messages and retry options
- **User Control**: Full manual control over update process
- **Transparency**: Clear communication of update status at all times

### Technical
- Rebuilt auto-updater from ground up using electron-updater
- Added electron-log for production logging
- Implemented proper IPC handlers for all update operations
- Created comprehensive CSS styling for update modals
- Added 6 different update views (checking, available, downloading, ready, up-to-date, error)
- Integrated GitHub release notes parsing
- Added formatBytes helper for human-readable file sizes

### Fixed
- Auto-updater now works reliably in production builds
- Proper development mode detection (no false update attempts)
- Update indicator properly shows and hides based on status
- Download progress accurately tracked and displayed

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
