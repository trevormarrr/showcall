# Visual Preset Editor Guide

## ShowCall v2.1.0 - Visual Preset Management

### Overview
The new visual preset editor replaces the old JSON textarea with an intuitive, form-based interface that allows operators to manage presets without any technical knowledge.

---

## Features

### 📋 **Preset List View**
- **Visual Overview**: See all your presets at a glance
- **Color Indicators**: Each preset displays its button color
- **Quick Info**: View ID, hotkey, and step count for each preset
- **Actions**: Edit, duplicate, or delete presets with one click

### ✏️ **Visual Preset Editor**
- **Form-Based Input**: Simple fields for:
  - Preset ID (unique identifier)
  - Display Name (what users see)
  - Hotkey (single keyboard shortcut)
  - Button Color (visual color picker)

### 🎬 **Macro Step Builder**
- **Visual Step Display**: Each step shows:
  - Icon representing the action type
  - Step name (Trigger, Cut, Clear, etc.)
  - Parameters formatted in plain English
- **Add Steps**: Select from dropdown:
  - **Trigger Clip**: Fire a specific layer/column
  - **Trigger Column**: Fire an entire column
  - **Cut to Program**: Preview → Program transition
  - **Clear All**: Clear all active layers
  - **Sleep/Wait**: Add delay between steps
- **Edit Steps**: Click "Edit" to modify parameters inline
- **Delete Steps**: Remove unwanted steps with "×" button
- **Reorder**: Drag steps using the ☰ handle (coming in v2.2)

---

## How to Use

### Creating a New Preset

1. Click **"🎛️ Presets"** button in top header
2. Click **"+ Add New Preset"**
3. Fill in the form:
   ```
   Preset ID:      walkin          (lowercase, no spaces)
   Display Name:   Walk-In Scene
   Hotkey:         1               (optional)
   Button Color:   #0ea5e9         (click to choose)
   ```
4. Add macro steps:
   - Select step type from dropdown
   - Edit parameters as needed
   - Add multiple steps in sequence
5. Click **"Save Preset"**

### Editing an Existing Preset

1. Open Presets modal
2. Click **"Edit"** on any preset
3. Modify any field or steps
4. Click **"Save Preset"** to update

### Duplicating a Preset

1. Open Presets modal
2. Click **"Duplicate"** on any preset
3. A copy is created with "_copy" suffix
4. Edit the duplicate as needed

### Deleting a Preset

1. Open Presets modal
2. Click **"Edit"** on the preset
3. Click **"Delete Preset"** (bottom button)
4. Confirm deletion

---

## Step Types Explained

### 🎬 Trigger Clip
Fire a specific clip by layer and column number.
```
Parameters:
- Layer: 1-8 (which layer)
- Column: 1-20 (which column)
```

### 📊 Trigger Column
Activate all clips in a specific column.
```
Parameters:
- Column: 1-20 (which column)
```

### ✂️ Cut to Program
Transition active preview clips to program output.
```
No parameters needed.
```

### 🧹 Clear All
Clear all active clips from all layers.
```
No parameters needed.
```

### ⏱️ Sleep/Wait
Add a delay between steps.
```
Parameters:
- Wait Time: milliseconds (e.g., 200ms)
```

---

## Example Preset

**Walk-In Scene:**
1. Clear All → Clear everything
2. Sleep 200ms → Brief pause
3. Trigger L1C1 → Background layer, column 1
4. Trigger L2C1 → Video layer, column 1
5. Cut to Program → Make it live

---

## Tips

✅ **Use Descriptive Names**: "Sermon Scene" is better than "Preset 2"
✅ **Single Character Hotkeys**: Use 1-9, A-Z for quick access
✅ **Unique IDs**: Each preset needs a unique lowercase ID
✅ **Test Your Macros**: Create simple presets first, then expand
✅ **Duplicate for Variations**: Copy similar presets and modify them

❌ **Don't Use Spaces in IDs**: Use `walk_in` or `walkin`, not `walk in`
❌ **Don't Reuse Hotkeys**: Each hotkey should be unique
❌ **Don't Skip Validation**: Red text means something needs fixing

---

## Migration from v2.0

If you have existing presets from ShowCall v2.0, they will automatically work with the new visual editor. The JSON structure remains the same under the hood—we just made it easier to edit!

---

## Technical Details

### Data Format
Presets are stored in `/api/presets` endpoint and saved to `config.json`:
```json
{
  "presets": [
    {
      "id": "walkin",
      "label": "Walk-In Scene",
      "color": "#0ea5e9",
      "hotkey": "1",
      "macro": [
        { "type": "clear" },
        { "type": "sleep", "ms": 200 },
        { "type": "trigger", "layer": 1, "column": 1 },
        { "type": "cut" }
      ]
    }
  ]
}
```

### Architecture
- **List View**: Browse all presets
- **Edit View**: Form-based editor with validation
- **Auto-Refresh**: Deck updates immediately after saving
- **Hotkey Re-registration**: Keyboard shortcuts sync automatically

---

## Future Enhancements (v2.2+)

🔜 **Drag-and-Drop Step Reordering**: Rearrange macro steps visually
🔜 **Step Templates**: Pre-built step sequences for common patterns
🔜 **Import/Export**: Share presets with other ShowCall users
🔜 **Undo/Redo**: Safety net while editing
🔜 **Visual Macro Preview**: See what your macro will do before saving

---

## Support

For issues or questions:
- GitHub: https://github.com/trevormarrr/showcall/issues
- Documentation: See README.md in the project root
