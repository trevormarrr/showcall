# ShowCall v2.3.0 - Stream Deck Integration Update

## 🎉 What's New

### Automatic Preset Synchronization with Stream Deck

ShowCall now features **seamless integration** with Bitfocus Companion and Stream Deck! When you create, edit, or delete presets in ShowCall, they automatically sync to your Stream Deck with zero configuration.

## Key Features

### 🔄 Real-Time Sync
- Create a preset in ShowCall → Instantly appears on Stream Deck
- Edit a preset → Stream Deck button updates automatically  
- Delete a preset → Stream Deck button is removed
- No manual configuration required!

### 🎨 Smart Button Styling
- Buttons use colors defined in ShowCall
- Text color automatically optimized for readability
- Button labels match your preset names
- Visual feedback shows connection status

### 🎯 One-Touch Execution
- Press Stream Deck button → Execute complete macro sequence
- Supports all macro types (trigger, cut, clear, sleep)
- Works with multi-step presets
- Full feedback integration

## Quick Setup

### 1. Install ShowCall Companion Module

```bash
cd showcall-companion
npm install
npm run build
```

Copy the `.tgz` file to Companion's module directory or install via Companion UI.

### 2. Configure Companion Connection

1. Open Bitfocus Companion
2. Add ShowCall connection
3. Set Host: `localhost` (or your ShowCall server IP)
4. Set Port: `3200` (default)
5. Save and connect

### 3. Create Presets in ShowCall

1. Open ShowCall app
2. Click "Presets" button (top right)
3. Click "Add New Preset"
4. Configure:
   - **ID**: `worship_intro` (unique identifier)
   - **Label**: `Worship Intro` (display name)
   - **Color**: `#e11d48` (button color)
   - **Hotkey**: `w` (optional keyboard shortcut)
5. Add macro steps:
   - Clear All Layers
   - Wait 200ms
   - Trigger Layer 1, Column 3
   - Trigger Layer 2, Column 3
   - Cut to Program
6. Save

### 4. Use on Stream Deck

1. In Companion, go to Buttons
2. Find "ShowCall Presets" category
3. Your preset appears automatically!
4. Drag to Stream Deck
5. Press to execute

## Documentation

- **[Complete Preset Sync Guide](PRESET_SYNC_GUIDE.md)** - Full user documentation
- **[Companion Integration Guide](../showcall-companion/PRESET_INTEGRATION.md)** - Technical details
- **[API Reference](PRESET_SYNC_GUIDE.md#api-reference)** - WebSocket protocol

## Examples

### Simple Scene Preset

```json
{
  "id": "baptism_scene",
  "label": "Baptism Camera",
  "color": "#8b5cf6",
  "macro": [
    { "type": "clear" },
    { "type": "sleep", "ms": 200 },
    { "type": "trigger", "layer": 1, "column": 3 },
    { "type": "trigger", "layer": 2, "column": 3 },
    { "type": "cut" }
  ]
}
```

**Result**: Purple Stream Deck button labeled "Baptism Camera" that executes the macro when pressed.

### Complex Transition

```json
{
  "id": "worship_full",
  "label": "Full Worship",
  "color": "#e11d48",
  "macro": [
    { "type": "triggerColumn", "column": 5 },
    { "type": "sleep", "ms": 100 },
    { "type": "trigger", "layer": 3, "column": 2 },
    { "type": "trigger", "layer": 4, "column": 2 },
    { "type": "sleep", "ms": 50 },
    { "type": "cut" }
  ]
}
```

**Result**: Red Stream Deck button that triggers entire column 5, adds graphics layers, and cuts to program.

## Workflow Benefits

### Before v2.3.0
1. Create preset in ShowCall ✅
2. Open Companion ❌
3. Create new button manually ❌
4. Configure action manually ❌
5. Set button colors manually ❌
6. Test and repeat for each preset ❌

### With v2.3.0
1. Create preset in ShowCall ✅
2. Done! ✨

## Troubleshooting

### Presets Not Syncing

**Check Connection**:
```bash
# In ShowCall logs, look for:
✅ Companion module connected from: 192.168.1.100
✅ Sent presets to new Companion client
```

**Reconnect Companion**:
1. In Companion, find ShowCall connection
2. Click "Reconnect"
3. Watch logs for connection message

### Button Not Executing

**Verify Preset**:
1. Test preset directly in ShowCall first
2. Check that Resolume is connected
3. Verify layer/column numbers are valid

**Check Logs**:
```bash
# ShowCall should show:
🎯 Executing preset: worship_intro
✅ Macro step 1/5 completed
```

## Upgrade from Earlier Versions

### If you're using ShowCall v1.3.x or earlier:

1. **Update ShowCall**:
   ```bash
   cd showcall
   git pull
   npm install
   npm run build
   ```

2. **Update Companion Module**:
   ```bash
   cd showcall-companion
   git pull
   npm install
   npm run build
   ```

3. **Reinstall Module** in Companion:
   - Remove old ShowCall connection
   - Reinstall module from new `.tgz`
   - Add connection with new settings
   - Presets will sync automatically

### Migrating Existing Presets

Your existing `presets.json` file is automatically used. No migration needed!

Location:
- **macOS**: `~/Library/Application Support/ShowCall/presets.json`
- **Windows**: `%APPDATA%\ShowCall\presets.json`
- **Linux**: `~/.showcall/presets.json`

## Technical Details

### WebSocket Protocol

**Preset Update Message**:
```json
{
  "type": "presets_updated",
  "data": [
    {
      "id": "worship_intro",
      "label": "Worship Intro",
      "color": "#e11d48",
      "hotkey": "w",
      "macro": [...]
    }
  ]
}
```

**Preset Execution**:
```json
{
  "action": "execute_macro",
  "macroId": "worship_intro"
}
```

### File Changes

**Modified Files**:
- `showcall/server.mjs` - Added preset broadcast on save
- `showcall-companion/main.js` - Added preset sync handler
- `showcall-companion/main.js` - Added dynamic preset generation

**New Files**:
- `showcall/PRESET_SYNC_GUIDE.md` - User documentation
- `showcall-companion/PRESET_INTEGRATION.md` - Technical guide
- `showcall/UPDATE_V2.3.0.md` - This file

## Changelog

### v2.3.0 (2026-02-14)

#### Added
- ✨ Automatic preset synchronization with Companion
- 🎨 Dynamic Stream Deck button generation
- 📡 Real-time preset updates via WebSocket
- 🎯 New "Execute ShowCall Preset" action
- 📚 Comprehensive documentation

#### Changed
- 🔄 Enhanced WebSocket communication
- 🎛️ Improved Companion module architecture
- 🔧 Better preset execution error handling

#### Fixed
- 🐛 Preset lookup now checks user presets first
- 🔌 Connection status feedback in Companion
- 📊 Improved logging and debugging

## Support

Need help?

1. **Read the guides**:
   - [Preset Sync Guide](PRESET_SYNC_GUIDE.md)
   - [Companion Integration](../showcall-companion/PRESET_INTEGRATION.md)

2. **Check the logs**:
   - ShowCall: Terminal/console output
   - Companion: Log viewer in Companion UI

3. **Common issues**:
   - Connection problems → Check host/port settings
   - Presets not syncing → Reconnect Companion
   - Execution fails → Test in ShowCall first

4. **GitHub Issues**:
   - Report bugs: https://github.com/trevormarrr/showcall/issues
   - Include logs and preset JSON

## What's Next?

Coming in future versions:

- 🎬 Preset execution feedback on Stream Deck
- 📸 Clip thumbnails in Companion
- 🔊 Audio level monitoring
- 🎨 Advanced button customization
- 📱 Mobile app integration

## License

Same MIT license as ShowCall main project.

---

**Enjoy the new preset sync feature!** 🎉

Create amazing presets in ShowCall and watch them instantly appear on your Stream Deck. No more manual configuration!
