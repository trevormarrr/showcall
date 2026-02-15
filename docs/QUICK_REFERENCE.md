# ShowCall + Stream Deck Quick Reference

## 🚀 Quick Setup (5 Minutes)

### 1. Install Companion Module
```bash
cd showcall-companion
npm install && npm run build
```
Install the `.tgz` file in Bitfocus Companion.

### 2. Connect to ShowCall
- **Host:** `localhost` (or ShowCall server IP)
- **Port:** `3200`

### 3. Create Presets in ShowCall
Click **Presets** → **Add New Preset** → Configure → **Save**

### 4. Use on Stream Deck
Buttons automatically appear in **ShowCall Presets** category!

---

## 📋 Preset Quick Create

### Minimal Preset
```json
{
  "id": "my_preset",
  "label": "My Preset",
  "color": "#0ea5e9",
  "macro": [
    {"type": "clear"},
    {"type": "trigger", "layer": 1, "column": 1},
    {"type": "cut"}
  ]
}
```

### Common Patterns

**Scene Change:**
```json
{"type": "clear"},
{"type": "sleep", "ms": 200},
{"type": "trigger", "layer": 1, "column": 3},
{"type": "trigger", "layer": 2, "column": 3},
{"type": "cut"}
```

**Column Trigger:**
```json
{"type": "triggerColumn", "column": 5},
{"type": "sleep", "ms": 100},
{"type": "cut"}
```

**Emergency Clear:**
```json
{"type": "clear"},
{"type": "cut"}
```

---

## 🎨 Color Codes

Use these hex colors for consistent button themes:

| Theme | Color Code | Use For |
|-------|-----------|---------|
| 🔵 Blue | `#0ea5e9` | Pre-service |
| 🟢 Green | `#22c55e` | Main content |
| 🟣 Purple | `#8b5cf6` | Special events |
| 🟠 Orange | `#f59e0b` | Transitions |
| 🔴 Red | `#e11d48` | Worship/urgent |
| 🟤 Brown | `#92400e` | Cleanup |

---

## ⌨️ Macro Actions

| Action | Parameters | Example |
|--------|-----------|---------|
| `clear` | None | `{"type": "clear"}` |
| `cut` | None | `{"type": "cut"}` |
| `sleep` | `ms` | `{"type": "sleep", "ms": 200}` |
| `trigger` | `layer`, `column` | `{"type": "trigger", "layer": 1, "column": 1}` |
| `triggerColumn` | `column` | `{"type": "triggerColumn", "column": 5}` |

---

## 🔧 Troubleshooting

### Presets Not Showing on Stream Deck
1. Check Companion is connected
2. Look for "ShowCall Presets" category
3. Try reconnecting Companion
4. Restart Companion if needed

### Button Not Working
1. Test preset in ShowCall first
2. Check ShowCall logs for errors
3. Verify Resolume connection
4. Check layer/column numbers

### Colors Not Right
1. Use hex format: `#RRGGBB`
2. Example: `#ff0000` for red
3. Edit preset and save to update

### Connection Issues
1. Verify ShowCall is running
2. Check host/port in Companion
3. Ensure port 3200 is open
4. Check firewall settings

---

## 📊 Status Indicators

Use Companion variables in button text:

```
$(showcall:connection_status)
$(showcall:program_clips) clips
$(showcall:bpm) BPM
```

Example button text:
```
My Preset
$(showcall:program_clips) active
```

---

## 🎯 Best Practices

### ✅ DO
- Use clear, descriptive labels
- Keep IDs short and unique
- Test macros before live use
- Add small delays between actions
- Use consistent color themes
- Document your presets

### ❌ DON'T
- Use duplicate IDs
- Skip testing new presets
- Make macros too complex
- Use random colors
- Forget to save presets
- Delete presets during shows

---

## 📍 File Locations

### macOS
```
~/Library/Application Support/ShowCall/presets.json
~/Library/Application Support/ShowCall/.env
```

### Windows
```
%APPDATA%\ShowCall\presets.json
%APPDATA%\ShowCall\.env
```

### Linux
```
~/.showcall/presets.json
~/.showcall/.env
```

---

## 🆘 Quick Commands

### Test ShowCall API
```bash
curl http://localhost:3200/api/presets
```

### Check ShowCall Status
```bash
curl http://localhost:3200/api/status
```

### View Logs (macOS/Linux)
```bash
tail -f ~/Library/Application\ Support/ShowCall/logs/app.log
```

### Restart ShowCall
```bash
# In ShowCall directory
npm run dev
```

---

## 📚 Full Documentation

- **User Guide:** `PRESET_SYNC_GUIDE.md`
- **Technical Docs:** `showcall-companion/PRESET_INTEGRATION.md`
- **Release Notes:** `UPDATE_V2.3.0.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`

---

## 💡 Tips & Tricks

### Rapid Preset Creation
1. Duplicate existing preset
2. Change ID and label
3. Adjust macro steps
4. Save → Instantly on Stream Deck!

### Organized Layout
- **Row 1:** System controls (Clear, Cut, etc.)
- **Row 2-4:** Scene presets (organized by service flow)
- **Row 5:** Emergency/utility buttons
- **Column 8:** Status indicators

### Color Organization
Group by service section:
- **Blue buttons:** Pre-service (walk-in, countdown)
- **Red buttons:** Worship scenes
- **Green buttons:** Teaching/sermon
- **Purple buttons:** Special moments (baptism, communion)
- **Orange buttons:** Transitions and outros

### Testing Workflow
1. Create preset in ShowCall
2. Test by clicking in ShowCall
3. Verify on Stream Deck
4. Test from Stream Deck
5. Adjust timing if needed
6. Document what it does

---

## 🎬 Example Presets

### Walk-In Scene
```json
{
  "id": "walkin",
  "label": "Walk-In",
  "color": "#0ea5e9",
  "hotkey": "1",
  "macro": [
    {"type": "clear"},
    {"type": "sleep", "ms": 200},
    {"type": "trigger", "layer": 1, "column": 1},
    {"type": "trigger", "layer": 2, "column": 1},
    {"type": "cut"}
  ]
}
```

### Full Worship
```json
{
  "id": "worship_full",
  "label": "Full Worship",
  "color": "#e11d48",
  "hotkey": "w",
  "macro": [
    {"type": "triggerColumn", "column": 3},
    {"type": "sleep", "ms": 100},
    {"type": "trigger", "layer": 3, "column": 5},
    {"type": "cut"}
  ]
}
```

### Emergency Clear
```json
{
  "id": "clear_all",
  "label": "CLEAR",
  "color": "#dc2626",
  "hotkey": "c",
  "macro": [
    {"type": "clear"},
    {"type": "cut"}
  ]
}
```

---

**Version:** 2.3.0 | **Support:** github.com/trevormarrr/showcall

*Print this reference card for quick access during shows!*
