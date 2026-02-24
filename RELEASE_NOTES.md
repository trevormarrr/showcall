# ShowCall v2.3.6 — Grid Scrolling Improvement 🎯# ShowCall v2.3.5 — Maintenance & Consistency Release 🔧# ShowCall v2.3.4 — Code Signing & Auto-Updater Fix 🔐✨# ShowCall v2.3.2 — Real-Time Sync & Visual Feedback 🔄✨



**Release Date:** February 24, 2026  

**Status:** Stable Feature Release

**Release Date:** February 16, 2026  

## 🎯 What's New in v2.3.6

**Status:** Stable Maintenance Release

### ✨ Horizontal Grid Scrolling

**Release Date:** February 16, 2026  **Release Date:** February 15, 2026  

**Finally fixed!** The column grid now scrolls horizontally so you can see ALL your columns, even if you have 20, 30, or 40+ columns in your Resolume composition.

## 🎯 What's in This Release

**Before:**

- Clicking expand (▶) only showed about half the columns**Status:** Stable Security & Stability Release**Status:** Stable Bug Fix Release

- Columns were compressed and hard to read

- Many columns were completely hiddenThis is a **maintenance release** focused on version consistency and documentation improvements. All features from v2.3.4 are included and working perfectly!



**After:**

- ✅ All columns visible via horizontal scroll

- ✅ Smooth scrolling with mouse wheel or trackpad### 🔧 Updates in v2.3.5

- ✅ Custom styled scrollbar (blue accent, 10px height)

- ✅ Fixed 120px column widths for consistency## 🎯 What's New## 🐛 Critical Bug Fixes

- ✅ Layer labels stay fixed on the left

**Version Consistency:**

### How to Use

- ✅ Updated UI version display to v2.3.5

1. Open ShowCall and connect to Resolume

2. Click the **▶ button** in the top-left of the grid- ✅ Synchronized all documentation version references

3. All columns are now visible!

4. Scroll horizontally to navigate through all columns- ✅ Updated README download linksThis release focuses on **security, trust, and seamless updates** for all macOS users.This release fixes two important issues reported in v2.3.0 Stream Deck integration:

5. Layer labels remain fixed for easy reference

- ✅ Aligned CHANGELOG entries

---



## ✨ All Features from v2.3.5 Included

**Why This Matters:**

### 🔐 Code Signing & Notarization

- ✅ Fully signed macOS builds (no security warnings)- Ensures users see consistent version numbers across the app### 🔐 Full Code Signing & Notarization### Fixed Issue #1: Instant Preset Updates ✅

- ✅ Apple notarized and approved

- ✅ Professional installation experience- Prevents confusion when checking "About" or documentation



### 🔄 Auto-Updater- Makes support and troubleshooting easier**Problem:** Presets didn't update on Stream Deck without restarting Companion module  

- ✅ Seamless in-app updates from v2.3.4+

- ✅ One-click update installation

- ✅ Secure code signature validation

---**All macOS builds are now properly signed and notarized with Apple:****Solution:** Automatic broadcast of preset updates when saved  

### 🎛️ Stream Deck Integration

- ✅ Instant preset synchronization

- ✅ Visual button feedback (orange flash)

- ✅ Zero manual configuration## ✨ All Features Included (from v2.3.4)**Result:** Presets now appear/update instantly (<100ms)

- ✅ Real-time updates (<100ms)



### 🎯 Core Features

- ⚡ OSC control (UDP port 7000)### 🔐 Full Code Signing & Notarization✅ **No More Security Warnings**

- 📊 REST API monitoring (port 8080)

- 🔌 Auto-discovery of Resolume composition

- 🎯 Visual clip grid with live states

- 💻 Cross-platform (macOS, Windows, Linux)**All macOS builds are properly signed and notarized:**- Eliminates "ShowCall is damaged" errors### Fixed Issue #2: Visual Button Feedback ✅



---



## 📥 Download & Installation✅ **No Security Warnings**- No more "unverified developer" warnings**Problem:** No visual indication when pressing preset buttons  



### Fresh Installation- Opens directly without "damaged" or "unverified developer" errors



**Download the appropriate version for your platform:**- Passes macOS Gatekeeper automatically- Opens directly without Gatekeeper bypasses**Solution:** Active state tracking with bright orange flash  



- **macOS (Apple Silicon):** [ShowCall-2.3.6-mac-arm64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.6/ShowCall-2.3.6-mac-arm64.dmg)- Professional installation experience

- **macOS (Intel):** [ShowCall-2.3.6-mac-x64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.6/ShowCall-2.3.6-mac-x64.dmg)

- **Windows:** [ShowCall-Setup-2.3.6.exe](https://github.com/trevormarrr/showcall/releases/download/v2.3.6/ShowCall-Setup-2.3.6.exe)- Professional, trusted installation experience**Result:** Buttons flash orange for 500ms when pressed

- **Linux:** [ShowCall-2.3.6.AppImage](https://github.com/trevormarrr/showcall/releases/download/v2.3.6/ShowCall-2.3.6.AppImage)

✅ **Apple Notarized**

### Updating from Previous Versions

- Scanned and approved by Apple

✅ **From v2.3.4, v2.3.5:** Auto-update available in-app! Just click "Update" when prompted.

- Enterprise-ready distribution

⚠️ **From v2.3.2 or earlier:** One-time manual download required. After installing v2.3.6, all future updates will work automatically through the built-in updater.

- Same trust level as major commercial apps✅ **Apple Notarization**## 🎯 What's Fixed

---



## 🎨 Technical Details

✅ **Enhanced Security**- Apps are scanned and approved by Apple

### Grid Scrolling Implementation

- Hardened Runtime enabled

**CSS Changes:**

```css- Code signature verification at every launch- Passes macOS security checks automatically### Real-Time Preset Synchronization

#grid {

  overflow-x: auto;      /* Enable horizontal scrolling */- Protected against tampering

  overflow-y: hidden;    /* Prevent vertical scroll */

  scrollbar-width: thin; /* Firefox */- Professional distribution standard met- ✅ Presets update on Stream Deck **instantly** when saved

  scrollbar-color: rgba(125, 211, 252, 0.5) rgba(255, 255, 255, 0.1);

}### 🔄 Auto-Updater Working Perfectly



/* Custom webkit scrollbar */- ✅ No more manual Companion restarts needed

#grid::-webkit-scrollbar {

  height: 10px;✅ **Seamless Updates**

}

- In-app update notifications✅ **Enhanced Security**- ✅ Create preset → Appears immediately (<100ms)

#grid::-webkit-scrollbar-thumb {

  background: rgba(125, 211, 252, 0.5);- One-click update installation

  border-radius: 5px;

}- Progress tracking and download management- Hardened Runtime enabled for better protection- ✅ Modify preset → Updates automatically

```

- No more manual downloads needed!

**JavaScript Logic:**

```javascript- Proper entitlements configured- ✅ Delete preset → Removed from Stream Deck instantly

// Fixed widths when expanded for consistent scrolling

if (gridView.expandedColumns) {✅ **Code Signature Validation**

  container.style.gridTemplateColumns = `160px repeat(${displayColumns}, 120px)`;

} else {- All updates properly signed- Code signature verification at every launch

  container.style.gridTemplateColumns = `160px repeat(${displayColumns}, minmax(100px, 1fr))`;

}- Secure update chain from v2.3.4+

```

- Automatic validation before installation### Active Button Visual Feedback

### Browser Support



✅ **Scrollbar styling works on:**

- Chrome/Edge (webkit scrollbar)### 🎛️ Stream Deck Integration### 🔄 Auto-Updater Fixed- ✅ Buttons **flash bright orange** when pressed

- Firefox (scrollbar-width/scrollbar-color)

- Safari (webkit scrollbar)



---✅ **Preset Synchronization**- ✅ 500ms visual feedback window



## 🚀 What This Means for You- Create presets → Instant appearance on Stream Deck



### For Users with Many Columns- Real-time updates (<100ms)**Seamless updates are here!**- ✅ Clear indication of preset execution



If you have compositions with 20+ columns:- Zero manual button configuration

- ✅ No more hidden columns

- ✅ All columns accessible via smooth scroll- Colors and labels always match- ✅ Better user experience with immediate confirmation

- ✅ Easy navigation with mouse wheel

- ✅ Visual consistency with fixed widths



### For Stream Deck Users✅ **Visual Feedback**✅ **Fixed Code Signature Validation**- ✅ Multiple buttons can be pressed in sequence with visual feedback



- ✅ Full grid visibility helps with preset creation- Buttons flash orange when pressed

- ✅ See all available clips at a glance

- ✅ Better understanding of composition structure- 500ms visual confirmation window- Resolved "code failed to satisfy specified code requirement(s)" error



### For Live Productions- Clear execution indication



- ✅ Quick access to all columns during shows- Auto-updater now works reliably for signed builds## 🚀 Quick Start

- ✅ Smooth scrolling doesn't interrupt workflow

- ✅ Layer labels always visible for reference### 🎯 Core Features



---- One-time manual installation required (see below)



## 📋 Complete Feature List✅ **OSC Control & REST Monitoring**



### Control & Monitoring- Lightning-fast clip triggering### If You Have v2.3.0 or v2.3.1

- ⚡ Lightning-fast OSC control (<1ms latency)

- 📊 Real-time REST API monitoring- Real-time composition monitoring

- 🔌 Automatic Resolume composition discovery

- 🎯 Visual clip grid with live program/preview states- Auto-discovery of Resolume structure✅ **Future-Proof Updates**

- 💻 Cross-platform support (macOS, Windows, Linux)



### Grid & Navigation

- 🖱️ **Horizontal scrolling for all columns** (NEW!)✅ **Preset Macros**- All releases from v2.3.4 forward will auto-update seamlessly**Simply update both:**

- 📏 Fixed column widths when expanded

- 🎨 Custom styled scrollbar- Multi-step automation sequences

- 🔄 Expand/collapse layers and columns

- 🏷️ Fixed layer labels for easy reference- Keyboard hotkey support- No more manual downloads needed after v2.3.41. Install ShowCall v2.3.2



### Presets & Automation- Import/export functionality

- 🎹 Multi-step macro sequences

- ⌨️ Keyboard hotkey support (1-9, A-Z)- In-app update notifications work perfectly2. Update Companion module to v2.1.1

- 🎛️ Automatic Stream Deck synchronization

- 🎨 Custom colors and labels---

- 📦 Import/export preset functionality

- ✨ Visual button feedback (orange flash)3. Enjoy the fixes! 🎉



### Interface & UX## 📥 Download & Installation

- 🪟 Pop-out preset deck window

- 🎬 Quick actions (Cut, Clear, Trigger Column)## ⚠️ Important: One-Time Manual Installation Required

- ⚙️ Settings modal for easy configuration

- 🔄 In-app auto-updater with progress tracking### Fresh Installation

- 📱 Responsive design

**Testing the fixes:**

### Security & Updates

- 🔐 Code signed and notarized (macOS)**Download the appropriate version:**

- 🔒 Hardened Runtime enabled

- 🔄 Seamless auto-updates from v2.3.4+### If You're Using v2.3.2 or Earlier1. Create/edit a preset in ShowCall

- ✅ No security warnings on any platform

- **macOS (Apple Silicon):** [ShowCall-2.3.5-mac-arm64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.5/ShowCall-2.3.5-mac-arm64.dmg)

---

- **macOS (Intel):** [ShowCall-2.3.5-mac-x64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.5/ShowCall-2.3.5-mac-x64.dmg)2. Watch it update instantly on Stream Deck

## 📚 Documentation

- **Windows:** [ShowCall-Setup-2.3.5.exe](https://github.com/trevormarrr/showcall/releases/download/v2.3.5/ShowCall-Setup-2.3.5.exe)

- [Quick Start Guide](https://github.com/trevormarrr/showcall#quick-start)

- [Stream Deck Setup](docs/PRESET_SYNC_GUIDE.md)- **Linux:** [ShowCall-2.3.5.AppImage](https://github.com/trevormarrr/showcall/releases/download/v2.3.5/ShowCall-2.3.5.AppImage)Because previous versions were **unsigned**, the auto-updater cannot validate the transition to signed builds.3. Press a button and see it flash orange

- [Code Signing Details](docs/CODE_SIGNING.md)

- [API Reference](docs/QUICK_REFERENCE.md)

- [Troubleshooting](docs/INSTALLATION.md)

### Updating from v2.3.44. Both issues resolved!

---



## 🔄 Version History

✅ **Auto-update available!** Just click "Update" when prompted in the app.**You must manually download and install v2.3.4:**

- **v2.3.6** (Feb 24, 2026) - Grid horizontal scrolling

- **v2.3.5** (Feb 16, 2026) - Maintenance release, version consistency

- **v2.3.4** (Feb 16, 2026) - Code signing and notarization

- **v2.3.3** (Feb 16, 2026) - Initial signing configuration### Updating from v2.3.2 or Earlier## 📦 What's Included

- **v2.3.2** (Feb 15, 2026) - Real-time preset sync fixes

- **v2.3.0** (Feb 14, 2026) - Stream Deck integration



---⚠️ **One-time manual installation required:**1. **Download** the latest release:



## 🙏 Thank You!



This release improves the grid experience for users with large Resolume compositions. We hope the horizontal scrolling makes your workflow even smoother!1. Download the appropriate installer above   - [ShowCall-2.3.4-mac-arm64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.4/ShowCall-2.3.4-mac-arm64.dmg) (Apple Silicon)### Bug Fixes



### What's Next?2. Install by dragging to Applications (macOS) or running installer (Windows)



**Planned for future releases:**3. All future updates will work automatically! 🎉   - [ShowCall-2.3.4-mac-x64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.4/ShowCall-2.3.4-mac-x64.dmg) (Intel)- 🔄 Real-time preset sync (no restart needed)

- Preset thumbnails and icons

- Execution history tracking

- Enhanced Stream Deck feedback

- Additional preset actions**Why?** Previous versions were unsigned, so the auto-updater can't validate the transition to signed builds. This is a security feature, not a bug!- ✨ Active button visual feedback (orange flash)

- Grid search/filter functionality



---

---2. **Install** by dragging to Applications folder- 📡 Enhanced WebSocket broadcasting

**Questions or Issues?**

- [Open an Issue](https://github.com/trevormarrr/showcall/issues)

- [Read the Docs](docs/README.md)

- [Check Discussions](https://github.com/trevormarrr/showcall/discussions)## 🚀 What This Release Means- ⚡ Improved state tracking and coordination



**Enjoy seamless, professional Resolume control with full grid visibility!** 🎬✨


### For All Users3. **Enjoy** - All future updates will work automatically! 🎉



- ✅ **Trusted Application** - No security warnings or workarounds### Technical Improvements

- ✅ **Seamless Updates** - One-click updates from v2.3.4+

- ✅ **Version Clarity** - Consistent version numbers everywhere### If You're Using v2.3.3- Added `activePresetId` state tracking

- ✅ **Professional Experience** - Enterprise-grade reliability

- Enhanced `/api/presets` POST endpoint with broadcast

### For macOS Users

You can update through the auto-updater OR manually install. Either works!- New `preset_executing` message type

- ✅ **Code Signed** - Developer ID Application: Offroadin' LLC (KHG523256M)

- ✅ **Notarized** - Approved by Apple's notary service- Improved `execute_macro` handler with state broadcasting

- ✅ **Hardened Runtime** - Enhanced security and stability

- ✅ **Gatekeeper Approved** - Opens without warnings## 🚀 What This Means for You- Optimized WebSocket message flow



### Verify the Code Signature (macOS)



```bash### Immediate Benefits### Companion Module v2.1.1

codesign -dvv /Applications/ShowCall.app

spctl -a -vv /Applications/ShowCall.app- New `preset_active` feedback type

```

- ✅ **Trusted App** - macOS recognizes ShowCall as a verified developer app- Enhanced message handling for execution state

You should see:

```- ✅ **Clean Installation** - No security warnings or workarounds needed- Improved button feedback system

Developer ID Application: Offroadin' LLC (KHG523256M)

Status: accepted- ✅ **Auto-Updates Work** - Future versions update seamlessly in-app- Better real-time coordination

```

- ✅ **Professional Experience** - Same trust level as major commercial apps

---

## 🔄 Upgrade from v2.3.0 or v2.3.1

## 📋 Complete Feature List

### Long-Term Benefits

### Control & Monitoring

- ⚡ OSC control (UDP port 7000)**No breaking changes!** Simple update process:

- 📊 REST API monitoring (port 8080)

- 🔌 Auto-discovery of Resolume composition- 🔐 **Better Security** - Code signing ensures app hasn't been tampered with

- 🎯 Visual clip grid with live states

- 💻 Cross-platform (macOS, Windows, Linux)- 🎯 **Easier Sharing** - Send download links to colleagues without installation instructions1. **Update ShowCall** to v2.3.2



### Presets & Automation- ⚡ **Faster Updates** - No more manual downloads for new releases2. **Update Companion module** to v2.1.1

- 🎹 Multi-step macro sequences

- ⌨️ Keyboard hotkey support- 📦 **Reliability** - Signed builds are more stable and predictable3. **Restart both** applications

- 🎛️ Stream Deck automatic sync

- 🎨 Custom colors and labels4. **Test the fixes** - create/edit presets, press buttons

- 📦 Import/export presets

## 📋 Technical Details5. Everything now updates in real-time! ✨

### Interface & UX

- 🪟 Pop-out preset deck window

- 🎬 Quick actions (Cut, Clear, etc.)

- ⚙️ Settings modal for configuration### Code Signing Configuration## 📚 Previous Release Notes

- 🔄 In-app auto-updater

- ✨ Visual button feedback



### Integration- **Developer ID Application** certificate from Apple---

- 📡 WebSocket API for real-time communication

- 🎛️ Bitfocus Companion module support- **Notarization** via Apple's notary service

- 🔗 REST API for external control

- 📊 SSE status streaming- **Hardened Runtime** enabled for enhanced security# ShowCall v2.3.0 — Stream Deck Integration Release 🎛️



---- **Entitlements** configured for proper macOS integration



## 📚 Documentation**Release Date:** February 14, 2026  



- [Quick Start Guide](https://github.com/trevormarrr/showcall#quick-start)### Build Process**Status:** Stable Release

- [Stream Deck Setup](docs/PRESET_SYNC_GUIDE.md)

- [Code Signing Details](docs/CODE_SIGNING.md)

- [API Reference](docs/QUICK_REFERENCE.md)

- [Troubleshooting](docs/INSTALLATION.md)- All macOS builds automatically signed via GitHub Actions## 🎉 Major Feature: Automatic Stream Deck Preset Sync



---- DMG and ZIP formats both signed and notarized



## 🔄 Version History- Update manifest (`latest-mac.yml`) properly configuredThis release introduces **revolutionary automatic preset synchronization** between ShowCall and Stream Deck via Bitfocus Companion. No more manual button configuration!



- **v2.3.5** (Feb 16, 2026) - Maintenance release, version consistency- Code signature embedded in app bundle

- **v2.3.4** (Feb 16, 2026) - Code signing and notarization

- **v2.3.3** (Feb 16, 2026) - Initial signing configuration### ✨ What's New

- **v2.3.2** (Feb 15, 2026) - Real-time preset sync fixes

- **v2.3.0** (Feb 14, 2026) - Stream Deck integration### Verification



---#### Automatic Preset Synchronization



## 🙏 Thank You!You can verify the code signature yourself:- **Create presets in ShowCall** → Instantly appear on Stream Deck



Thank you for using ShowCall! This maintenance release ensures a consistent, professional experience across all platforms.- **Edit presets** → Buttons update automatically in real-time  



### What's Next?```bash- **Delete presets** → Buttons removed automatically



**Planned for v2.4.0:**codesign -dvv /Applications/ShowCall.app- **Zero configuration** required for Stream Deck setup

- Preset thumbnails and icons

- Execution history trackingspctl -a -vv /Applications/ShowCall.app

- Enhanced Stream Deck feedback

- Additional preset actions```#### Smart Button Styling



---- Buttons automatically use colors defined in ShowCall



**Questions or Issues?**You should see:- Text color optimized for readability based on background

- [Open an Issue](https://github.com/trevormarrr/showcall/issues)

- [Read the Docs](docs/README.md)- Developer ID Application: Offroadin' LLC (KHG523256M)- Button labels match preset names exactly

- [Check Discussions](https://github.com/trevormarrr/showcall/discussions)

- Status: accepted- Connection status feedback built into every button

**Enjoy seamless, professional Resolume control!** 🎬✨

- Origin: Developer ID Application: Offroadin' LLC (KHG523256M)

#### Real-Time Updates

## 🎊 All Previous Features Still Included- Changes sync in less than 100ms via WebSocket

- Edit presets right up until show time

This release maintains all features from v2.3.2:- No manual button reconfiguration ever needed

- Works seamlessly across multiple Stream Decks

- ✅ Real-time preset sync with Stream Deck

- ✅ Visual button feedback (orange flash)### 🎯 Benefits

- ✅ Instant preset updates (<100ms)

- ✅ OSC control + REST monitoring**For Users:**

- ✅ Preset macros with hotkeys- ⚡ **90% faster setup** - No manual button configuration

- ✅ Auto-discovery of Resolume composition- 🎨 **100% accurate** - Colors and labels always match

- ✅ Cross-platform support- 🔄 **Real-time updates** - Changes sync instantly

- 🎯 **Easier workflows** - Create presets in one place

## 📚 Documentation

### 📚 Documentation

New documentation added:

Complete documentation suite included:

- [Code Signing Guide](docs/CODE_SIGNING.md) - Complete setup instructions- **PRESET_SYNC_GUIDE.md** - Complete user guide with setup and troubleshooting

- [GitHub Signing Checklist](docs/GITHUB_SIGNING_CHECKLIST.md) - Quick reference- **QUICK_REFERENCE.md** - One-page cheat sheet

- [Fix Auto Updater](docs/FIX_AUTO_UPDATER.md) - Troubleshooting guide- **PRESET_INTEGRATION.md** - Technical guide for Companion module

- **IMPLEMENTATION_SUMMARY.md** - Complete technical details

## 🙏 Thank You!

## 🚀 Quick Start

This release represents a major step forward in making ShowCall a professional, trustworthy application. We appreciate your patience with the one-time manual update.

1. **Update ShowCall** to v2.3.0

---2. **Build Companion Module:** `cd showcall-companion && npm run build`

3. **Connect Companion** to ShowCall (localhost:3200)

**Next Steps:**4. **Create Presets** in ShowCall

5. They appear on Stream Deck automatically! ✨

1. Download and install v2.3.4 manually (one time only)

2. Enjoy seamless auto-updates forever after! 🚀See **PRESET_SYNC_GUIDE.md** for complete setup instructions.



**Questions?** [Open an issue](https://github.com/trevormarrr/showcall/issues) or check the [documentation](docs/README.md).## 📦 What's Included


### New Features
- 🎛️ Automatic Stream Deck preset synchronization
- 📡 Enhanced WebSocket communication for real-time updates
- 🎨 Smart button styling with color optimization
- ⚡ New `execute_preset` action in Companion
- 📚 Comprehensive documentation suite
- 🧪 Automated test suite

### Enhanced
- 🔧 Companion Module v2.1.0 with dynamic buttons
- ⚡ Improved preset lookup and execution
- 📊 Better error handling and logging
- 🚀 Performance optimizations

## 🔄 Upgrade from v2.2.x

**No breaking changes!** Simply update and enjoy the new features:

1. Install ShowCall v2.3.0
2. Update Companion module to v2.1.0
3. Existing presets continue to work
4. New sync feature activates automatically

## 💡 Example Use Case

### Before v2.3.0 (Old Way)
1. Create "Worship Intro" preset in ShowCall ✅
2. Open Companion ❌
3. Manually create button ❌  
4. Configure action with preset ID ❌
5. Set button color ❌
6. Repeat for 10+ presets ❌
**Time: 30-45 minutes**

### With v2.3.0 (New Way)
1. Create "Worship Intro" preset in ShowCall ✅
2. Button appears on Stream Deck automatically! ✨
**Time: 2 minutes per preset**

## 🎨 Example Preset

```json
{
  "id": "worship_intro",
  "label": "Worship Intro",
  "color": "#e11d48",
  "hotkey": "w",
  "macro": [
    {"type": "clear"},
    {"type": "sleep", "ms": 200},
    {"type": "trigger", "layer": 1, "column": 3},
    {"type": "cut"}
  ]
}
```

This appears on your Stream Deck with a red background, "Worship Intro" label, and executes the macro when pressed!

## 🔧 Technical Details

### Architecture
```
ShowCall App → Creates Preset
     ↓
Server → Saves & Broadcasts via WebSocket
     ↓
Companion → Generates Stream Deck Buttons
     ↓
Stream Deck → Shows Buttons
     ↓
User Presses → Executes Preset
```

### New WebSocket Messages
- `presets_updated` - Broadcast when presets change
- Automatic preset sync on Companion connection
- Enhanced error reporting

### Performance
- Real-time sync in <100ms
- Minimal bandwidth (~1-5 KB per update)
- No polling required

## ✅ Compatibility

- ShowCall: v2.3.0+
- Companion Module: v2.1.0+
- Bitfocus Companion: v3.0+
- Resolume Arena: 7.19+
- Node.js: 16+

**Backward Compatible:** Works with existing installations, no breaking changes.

## 🆘 Troubleshooting

### Presets Not Syncing?
1. Verify ShowCall is running
2. Check Companion is connected  
3. Ensure port 3200 is accessible
4. Review logs for errors

See **PRESET_SYNC_GUIDE.md** for complete troubleshooting guide.

## 📞 Support

- **Documentation:** See `PRESET_SYNC_GUIDE.md` and `QUICK_REFERENCE.md`
- **GitHub Issues:** https://github.com/trevormarrr/showcall/issues
- **Changelog:** See `CHANGELOG.md` for complete version history

## 🔮 Coming Soon

Future enhancements planned:
- 🎨 Preset thumbnails/icons
- 📊 Execution history tracking
- 🔔 Execution feedback to Stream Deck
- 🎯 Preset favorites and categories

## 📝 Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for complete version history including all v2.2.x changes.

## 🎬 Getting Started

1. Download v2.3.0 from [GitHub Releases](https://github.com/trevormarrr/showcall/releases)
2. Install ShowCall
3. Read **PRESET_SYNC_GUIDE.md**
4. Create your first preset
5. Watch it appear on Stream Deck!

---

**Previous Releases**

## ShowCall v2.2.1 - Update System Fixes

### Fixed
- 🐛 Update button visibility in UI
- 🔧 DMG build issues in GitHub Actions
- 🔄 Auto-updater metadata files
- 📱 Version display (v2.2.1)

## ShowCall v2.2.0 - Enhanced Auto-Updater

### Added
- 🔄 Complete auto-updater system rebuild
- Beautiful modal UI with progress tracking
- Manual "Check for Updates" button
- Release notes display in-app

## ShowCall v1.2.0 — Presets Editor & Settings

### Highlights
- Presets Editor (🎛️ Presets): Edit labels, hotkeys, colors, and macro steps
- Settings Modal (⚙️ Settings): Configure Resolume IP/ports
- Update Check (⬇️ Check Updates): Quick access to latest releases

### Technical Changes
- Server converted to ESM (`server.mjs`)
- Added endpoints: `/api/presets`, `/api/settings`, `/api/update/check`
- Improved UI with better notifications

### Notes
- User data stored in: `~/Library/Application Support/ShowCall/`
  - `.env` — connection settings
  - `presets.json` — presets and quick cues
- Ensure Resolume Web Server (port 8080) and OSC (port 7000) are enabled

---

**Version:** 2.3.0  
**Release Date:** February 14, 2026  
**License:** MIT

**Download:** [GitHub Releases](https://github.com/trevormarrr/showcall/releases/tag/v2.3.0)

**Happy streaming! 🎬✨**