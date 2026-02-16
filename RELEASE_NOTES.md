# ShowCall v2.3.4 — Code Signing & Auto-Updater Fix 🔐✨# ShowCall v2.3.2 — Real-Time Sync & Visual Feedback 🔄✨



**Release Date:** February 16, 2026  **Release Date:** February 15, 2026  

**Status:** Stable Security & Stability Release**Status:** Stable Bug Fix Release



## 🎯 What's New## 🐛 Critical Bug Fixes



This release focuses on **security, trust, and seamless updates** for all macOS users.This release fixes two important issues reported in v2.3.0 Stream Deck integration:



### 🔐 Full Code Signing & Notarization### Fixed Issue #1: Instant Preset Updates ✅

**Problem:** Presets didn't update on Stream Deck without restarting Companion module  

**All macOS builds are now properly signed and notarized with Apple:****Solution:** Automatic broadcast of preset updates when saved  

**Result:** Presets now appear/update instantly (<100ms)

✅ **No More Security Warnings**

- Eliminates "ShowCall is damaged" errors### Fixed Issue #2: Visual Button Feedback ✅

- No more "unverified developer" warnings**Problem:** No visual indication when pressing preset buttons  

- Opens directly without Gatekeeper bypasses**Solution:** Active state tracking with bright orange flash  

- Professional, trusted installation experience**Result:** Buttons flash orange for 500ms when pressed



✅ **Apple Notarization**## 🎯 What's Fixed

- Apps are scanned and approved by Apple

- Passes macOS security checks automatically### Real-Time Preset Synchronization

- Professional distribution standard met- ✅ Presets update on Stream Deck **instantly** when saved

- ✅ No more manual Companion restarts needed

✅ **Enhanced Security**- ✅ Create preset → Appears immediately (<100ms)

- Hardened Runtime enabled for better protection- ✅ Modify preset → Updates automatically

- Proper entitlements configured- ✅ Delete preset → Removed from Stream Deck instantly

- Code signature verification at every launch

### Active Button Visual Feedback

### 🔄 Auto-Updater Fixed- ✅ Buttons **flash bright orange** when pressed

- ✅ 500ms visual feedback window

**Seamless updates are here!**- ✅ Clear indication of preset execution

- ✅ Better user experience with immediate confirmation

✅ **Fixed Code Signature Validation**- ✅ Multiple buttons can be pressed in sequence with visual feedback

- Resolved "code failed to satisfy specified code requirement(s)" error

- Auto-updater now works reliably for signed builds## 🚀 Quick Start

- One-time manual installation required (see below)

### If You Have v2.3.0 or v2.3.1

✅ **Future-Proof Updates**

- All releases from v2.3.4 forward will auto-update seamlessly**Simply update both:**

- No more manual downloads needed after v2.3.41. Install ShowCall v2.3.2

- In-app update notifications work perfectly2. Update Companion module to v2.1.1

3. Enjoy the fixes! 🎉

## ⚠️ Important: One-Time Manual Installation Required

**Testing the fixes:**

### If You're Using v2.3.2 or Earlier1. Create/edit a preset in ShowCall

2. Watch it update instantly on Stream Deck

Because previous versions were **unsigned**, the auto-updater cannot validate the transition to signed builds.3. Press a button and see it flash orange

4. Both issues resolved!

**You must manually download and install v2.3.4:**

## 📦 What's Included

1. **Download** the latest release:

   - [ShowCall-2.3.4-mac-arm64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.4/ShowCall-2.3.4-mac-arm64.dmg) (Apple Silicon)### Bug Fixes

   - [ShowCall-2.3.4-mac-x64.dmg](https://github.com/trevormarrr/showcall/releases/download/v2.3.4/ShowCall-2.3.4-mac-x64.dmg) (Intel)- 🔄 Real-time preset sync (no restart needed)

- ✨ Active button visual feedback (orange flash)

2. **Install** by dragging to Applications folder- 📡 Enhanced WebSocket broadcasting

- ⚡ Improved state tracking and coordination

3. **Enjoy** - All future updates will work automatically! 🎉

### Technical Improvements

### If You're Using v2.3.3- Added `activePresetId` state tracking

- Enhanced `/api/presets` POST endpoint with broadcast

You can update through the auto-updater OR manually install. Either works!- New `preset_executing` message type

- Improved `execute_macro` handler with state broadcasting

## 🚀 What This Means for You- Optimized WebSocket message flow



### Immediate Benefits### Companion Module v2.1.1

- New `preset_active` feedback type

- ✅ **Trusted App** - macOS recognizes ShowCall as a verified developer app- Enhanced message handling for execution state

- ✅ **Clean Installation** - No security warnings or workarounds needed- Improved button feedback system

- ✅ **Auto-Updates Work** - Future versions update seamlessly in-app- Better real-time coordination

- ✅ **Professional Experience** - Same trust level as major commercial apps

## 🔄 Upgrade from v2.3.0 or v2.3.1

### Long-Term Benefits

**No breaking changes!** Simple update process:

- 🔐 **Better Security** - Code signing ensures app hasn't been tampered with

- 🎯 **Easier Sharing** - Send download links to colleagues without installation instructions1. **Update ShowCall** to v2.3.2

- ⚡ **Faster Updates** - No more manual downloads for new releases2. **Update Companion module** to v2.1.1

- 📦 **Reliability** - Signed builds are more stable and predictable3. **Restart both** applications

4. **Test the fixes** - create/edit presets, press buttons

## 📋 Technical Details5. Everything now updates in real-time! ✨



### Code Signing Configuration## 📚 Previous Release Notes



- **Developer ID Application** certificate from Apple---

- **Notarization** via Apple's notary service

- **Hardened Runtime** enabled for enhanced security# ShowCall v2.3.0 — Stream Deck Integration Release 🎛️

- **Entitlements** configured for proper macOS integration

**Release Date:** February 14, 2026  

### Build Process**Status:** Stable Release



- All macOS builds automatically signed via GitHub Actions## 🎉 Major Feature: Automatic Stream Deck Preset Sync

- DMG and ZIP formats both signed and notarized

- Update manifest (`latest-mac.yml`) properly configuredThis release introduces **revolutionary automatic preset synchronization** between ShowCall and Stream Deck via Bitfocus Companion. No more manual button configuration!

- Code signature embedded in app bundle

### ✨ What's New

### Verification

#### Automatic Preset Synchronization

You can verify the code signature yourself:- **Create presets in ShowCall** → Instantly appear on Stream Deck

- **Edit presets** → Buttons update automatically in real-time  

```bash- **Delete presets** → Buttons removed automatically

codesign -dvv /Applications/ShowCall.app- **Zero configuration** required for Stream Deck setup

spctl -a -vv /Applications/ShowCall.app

```#### Smart Button Styling

- Buttons automatically use colors defined in ShowCall

You should see:- Text color optimized for readability based on background

- Developer ID Application: Offroadin' LLC (KHG523256M)- Button labels match preset names exactly

- Status: accepted- Connection status feedback built into every button

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