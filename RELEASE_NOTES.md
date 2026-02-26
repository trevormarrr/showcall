# ShowCall v2.4.3 Release Notes

## 🎯 Production Release

This release focuses on production readiness, adding cue editing capabilities, and cleaning up the interface for professional use.

### What's New

- ✅ **Edit Custom Cues** - Click "Edit" button in cue stack management to modify custom cues
- ✅ **Simplified Keyboard Shortcuts** - Removed 1-0 direct cue firing, kept Space (GO) and R (Reset)
- ✅ **Cleaner Interface** - Removed debug quick action buttons for production use
- ✅ **Documentation Cleanup** - Reorganized and updated all documentation
- ✅ **Version Consistency** - All files updated to v2.4.3

### Why This Update?

Based on user feedback, we've streamlined the cue stack workflow to be more professional and less prone to accidental triggers. The edit functionality for custom cues was the #1 requested feature, and debug controls were confusing for end users.

### Cue Editing

**How to edit a custom cue:**
1. Open cue stack management (⚙️ Manage button)
2. Find your custom cue in the list
3. Click the "Edit" button
4. Modify label, color, or actions
5. Save changes

**Note:** Preset-based cues cannot be edited (edit the preset itself instead). Only custom cues show the Edit button.

### Keyboard Shortcuts

**Updated shortcuts:**
- **Space** - GO (execute next cue)
- **R** - Reset (back to Cue 0)

**Removed:**
- Number keys 1-9/0 no longer fire specific cues directly
- This prevents accidental triggers during shows

### Coming Soon

Future releases will focus on:
- MIDI controller integration
- OSC input support (for external triggering)
- Cue list import/export
- Performance optimizations

---

## All v2.4 Features Included

## 🎭 Cue Stack System - Sequential Show Control

Professional theatrical-style cue stack for running shows cue by cue.

### Key Features

- **Theatrical Numbering**: Cue 0 (Standby), Cue 1, 2, 3...
- **Visual State Indicators**: Cyan (active), yellow (next), faded (completed)
- **Keyboard Shortcuts**: Space=GO, R=Reset
- **Preset & Custom Cues**: Add presets or build custom cues visually
- **Edit Custom Cues**: Modify cues after creation
- **Drag & Drop**: Easily reorder cues
- **Progress Tracking**: Visual progress bar and status
- **Auto Standby**: Every show starts with Cue 0

### Perfect For

- Worship services
- Theatre productions
- Concert tours
- Corporate events
- Any sequential programming

### Use Case Example: Worship Service

```
Cue 0: Standby (house lights up)
Cue 1: Walk-In (background loop)
Cue 2: Worship Set 1
Cue 3: Announcements  
Cue 4: Worship Set 2
Cue 5: Sermon
Cue 6: Closing
```

## 📦 Installation

### macOS
Download `ShowCall-2.4.3-arm64.dmg` for Apple Silicon or `ShowCall-2.4.3.dmg` for Intel Macs.

### Windows
Download `ShowCall-Setup-2.4.3.exe`

### Linux
Download `ShowCall-2.4.3.AppImage`

### Auto-Update
If you're on v2.3.4 or later, the app will automatically notify you of this update.

## 🔗 Links

- [Full Changelog](https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md)
- [Documentation](https://github.com/trevormarrr/showcall#readme)
- [Report Issues](https://github.com/trevormarrr/showcall/issues)

## ⬆️ Upgrading

All features from previous versions are included. Your existing presets, settings, compositions, and cue stacks will work seamlessly.

---

**What's Next?** Check out the [Roadmap](https://github.com/trevormarrr/showcall/blob/main/docs/ROADMAP.md) to see what's coming in future releases!
