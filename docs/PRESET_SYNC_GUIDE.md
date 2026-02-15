# ShowCall Preset Sync Guide

## Overview

ShowCall now supports **automatic preset synchronization** with the Companion module! When you create, edit, or delete presets in the ShowCall app, they automatically sync to your Stream Deck through the Companion module.

## Features

### 🎯 Dynamic Preset Execution
- Execute any preset created in ShowCall directly from your Stream Deck
- Presets update in real-time when modified in ShowCall
- No manual configuration needed in Companion

### 🔄 Automatic Synchronization
- Presets sync automatically when:
  - ShowCall Companion connects to ShowCall
  - A preset is created in ShowCall
  - A preset is edited in ShowCall
  - A preset is deleted in ShowCall

### 🎨 Smart Button Styling
- Stream Deck buttons automatically use the colors defined in ShowCall
- Text color is automatically optimized for readability based on background color
- Button labels match the preset names from ShowCall

## How It Works

### 1. Create a Preset in ShowCall

1. Open ShowCall app
2. Click the **"Presets"** button in the header
3. Click **"Add New Preset"**
4. Configure your preset:
   - **ID**: Unique identifier (e.g., `worship_intro`)
   - **Label**: Display name (e.g., `Worship Intro`)
   - **Hotkey**: Optional keyboard shortcut (e.g., `1`)
   - **Color**: Button color (e.g., `#0ea5e9`)
   - **Macro Steps**: Define the sequence of actions

Example macro steps:
```
1. Clear All Layers
2. Wait 200ms
3. Trigger Layer 1, Column 1
4. Trigger Layer 2, Column 1
5. Cut to Program
```

5. Click **"Save Preset"**

### 2. Automatic Stream Deck Integration

Once saved, the preset automatically appears in Companion:

1. Open **Companion** (Bitfocus Companion)
2. Navigate to **Buttons** in your Stream Deck configuration
3. Look for the **"ShowCall Presets"** category
4. Your new preset button is ready to use!

The button will:
- Display the preset label
- Use the color you defined
- Execute the preset macro when pressed
- Darken when ShowCall is disconnected

### 3. Execute Presets from Stream Deck

Simply press the Stream Deck button to execute the preset. The button will:
- Send the execution command to ShowCall
- ShowCall will execute the macro steps in sequence
- Visual feedback shows the button state

## Preset Configuration

### Preset Structure

Each preset consists of:

```json
{
  "id": "unique_preset_id",
  "label": "Display Name",
  "hotkey": "1",
  "color": "#0ea5e9",
  "macro": [
    { "type": "clear" },
    { "type": "sleep", "ms": 200 },
    { "type": "trigger", "layer": 1, "column": 1 },
    { "type": "trigger", "layer": 2, "column": 1 },
    { "type": "cut" }
  ]
}
```

### Available Macro Actions

| Type | Parameters | Description |
|------|-----------|-------------|
| `clear` | None | Clear all layers |
| `cut` | None | Cut preview to program |
| `sleep` | `ms` (number) | Wait specified milliseconds |
| `trigger` | `layer` (number), `column` (number) | Trigger specific clip |
| `triggerColumn` | `column` (number) | Trigger entire column |

### Color Format

Colors can be specified as:
- Hex string: `"#0ea5e9"` or `"0ea5e9"`
- CSS color name: `"red"`, `"blue"`, etc. (converted to hex)

## Advanced Usage

### Manual Preset Execution

You can also manually configure a button to execute a specific preset:

1. In Companion, add a new button
2. Add action: **"ShowCall: Execute ShowCall Preset"**
3. Enter the **Preset ID** from ShowCall
4. Customize button appearance as needed

### Preset Variables

In Companion, you can use these variables in button text:

- `$(showcall:connection_status)` - Connection status
- `$(showcall:program_clips)` - Number of active clips
- `$(showcall:bpm)` - Current BPM
- `$(showcall:composition_name)` - Composition name

Example button text:
```
$(showcall:connection_status)
Presets: $(showcall:program_clips)
```

### Feedback States

Preset buttons automatically respond to these feedbacks:

- **Connected**: Full color, normal brightness
- **Disconnected**: Darker color (50% brightness)
- **Active Clips**: Show clip count in button text (if configured)

## Troubleshooting

### Presets Not Appearing in Companion

1. **Check Connection**:
   - Verify ShowCall is running
   - Verify Companion is connected to ShowCall
   - Check Companion connection settings (host/port)

2. **Reconnect Companion**:
   - In Companion, click the ShowCall module
   - Click "Reconnect" or restart the connection
   - Check Companion logs for connection messages

3. **Verify Preset Configuration**:
   - Open ShowCall Presets editor
   - Ensure preset has a valid ID and Label
   - Check that preset is saved properly

### Preset Execution Fails

1. **Check ShowCall Connection**:
   - Ensure ShowCall can connect to Resolume
   - Verify Resolume is running and OSC/REST is enabled
   - Check ShowCall settings for correct Resolume host/port

2. **Verify Preset Macro**:
   - Open the preset in ShowCall editor
   - Test the macro by clicking "Fire Preset" in ShowCall
   - Check that layer/column numbers are valid

3. **Check Logs**:
   - ShowCall logs: Check terminal/console where ShowCall is running
   - Companion logs: Check Companion log viewer
   - Look for error messages related to preset execution

### Button Colors Not Updating

1. **Resync Presets**:
   - Edit the preset in ShowCall and save again
   - This forces a resync to Companion

2. **Recreate Button**:
   - Delete the button in Companion
   - Re-add it from the "ShowCall Presets" category
   - This ensures latest styling is applied

3. **Check Color Format**:
   - Ensure color is in hex format: `#RRGGBB`
   - Valid examples: `#FF0000`, `#00FF00`, `#0000FF`
   - Invalid examples: `red`, `rgb(255,0,0)`

## File Locations

### ShowCall Preset Storage

**macOS**:
```
~/Library/Application Support/ShowCall/presets.json
```

**Windows**:
```
%APPDATA%\ShowCall\presets.json
```

**Linux**:
```
~/.showcall/presets.json
```

### Manual Preset Editing

You can manually edit the `presets.json` file, but be careful:

1. Stop ShowCall
2. Edit the file with a text editor
3. Ensure valid JSON syntax
4. Restart ShowCall

**Note**: Manual edits won't trigger automatic sync to Companion until ShowCall restarts.

## Best Practices

### Preset Naming

- Use clear, descriptive labels
- Keep IDs short and unique
- Use consistent naming conventions

Examples:
```
ID: "worship_1"     Label: "Worship Intro"
ID: "sermon_main"   Label: "Main Sermon"
ID: "baptism_cam"   Label: "Baptism Camera"
```

### Preset Organization

- Create presets for complete scenes (not individual clips)
- Use colors to categorize presets:
  - Blue: Pre-service scenes
  - Green: Worship scenes
  - Orange: Sermon scenes
  - Purple: Special events
  - Red: Emergency/cleanup

### Macro Design

- Always start with `clear` to ensure clean state
- Add small delays (`sleep 200ms`) between actions
- End with `cut` to make changes visible
- Test macros thoroughly before live use

### Stream Deck Layout

Suggested layout:
- **Top Row**: System controls (Clear, Cut, Resync)
- **Middle Rows**: ShowCall presets (organized by service flow)
- **Bottom Row**: Individual clip controls
- **Right Column**: Status indicators

## API Reference

### WebSocket Messages

#### Preset Update Message (Server → Companion)

```json
{
  "type": "presets_updated",
  "data": [
    {
      "id": "preset_id",
      "label": "Preset Label",
      "color": "#0ea5e9",
      "hotkey": "1",
      "macro": [...]
    }
  ]
}
```

#### Preset Execution Command (Companion → Server)

```json
{
  "action": "execute_macro",
  "macroId": "preset_id"
}
```

### REST API Endpoints

#### Get Presets

```
GET /api/presets
```

Response:
```json
{
  "presets": [...],
  "quickCues": [...]
}
```

#### Save Presets

```
POST /api/presets
Content-Type: application/json

{
  "presets": [...],
  "quickCues": [...]
}
```

## Examples

### Example 1: Simple Scene Preset

```json
{
  "id": "walk_in",
  "label": "Walk-In Scene",
  "color": "#0ea5e9",
  "hotkey": "1",
  "macro": [
    { "type": "clear" },
    { "type": "sleep", "ms": 200 },
    { "type": "trigger", "layer": 1, "column": 1 },
    { "type": "trigger", "layer": 2, "column": 1 },
    { "type": "cut" }
  ]
}
```

### Example 2: Multi-Layer Transition

```json
{
  "id": "worship_full",
  "label": "Full Worship",
  "color": "#e11d48",
  "hotkey": "w",
  "macro": [
    { "type": "triggerColumn", "column": 3 },
    { "type": "sleep", "ms": 100 },
    { "type": "trigger", "layer": 3, "column": 5 },
    { "type": "cut" }
  ]
}
```

### Example 3: Emergency Clear

```json
{
  "id": "emergency_clear",
  "label": "CLEAR ALL",
  "color": "#dc2626",
  "macro": [
    { "type": "clear" },
    { "type": "cut" }
  ]
}
```

## Support

For issues or questions:

1. Check this guide first
2. Review ShowCall logs for error messages
3. Review Companion logs for connection issues
4. Check GitHub issues: https://github.com/trevormarrr/showcall
5. Create a new issue with:
   - ShowCall version
   - Companion version
   - Preset configuration (JSON)
   - Error messages from logs

## Changelog

### Version 2.3.0
- ✨ Added automatic preset synchronization
- 🎨 Dynamic button generation from ShowCall presets
- 🔄 Real-time preset updates to Companion
- 📡 Enhanced WebSocket communication for preset sync
- 🎯 New "Execute ShowCall Preset" action in Companion
