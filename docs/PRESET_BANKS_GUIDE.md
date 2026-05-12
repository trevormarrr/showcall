# Preset Banks Feature Guide

## Overview

The **Preset Banks** feature allows ShowCall to manage up to **5 independent preset banks**, each with its own set of presets. This enables seamless switching between different event configurations, team workflows, or venue setups without losing any data.

### Use Cases
- **Multi-Event Support**: Different worship services (Sunday, Wednesday, etc.) each with their own presets
- **Team Collaboration**: Different team members can maintain their own preset banks
- **Venue Configurations**: Quick switching between different room setups or equipment configurations
- **Backup & Recovery**: Export banks as backups and import them to recover from data loss

---

## Architecture

### File Structure

Preset banks are stored in the user data directory:
- **macOS**: `~/Library/Application Support/ShowCall/`
- **Windows**: `%AppData%/Roaming/ShowCall/`
- **Linux**: `~/.showcall/`

Each bank is saved as a separate JSON file:
```
preset-bank-1.json
preset-bank-2.json
preset-bank-3.json
preset-bank-4.json
preset-bank-5.json
presets-metadata.json  (stores bank names and current bank selection)
```

### Backwards Compatibility

- Old `presets.json` is automatically imported to Bank 1 on first load
- If no banks exist, the system loads the default `config.json` from the app package

---

## Bank Management UI

### 1. Bank Selector Screen

When opening the **Presets** modal, users first see the **Bank Selector** view:

```
┌─────────────────────────────────────┐
│ Manage Presets & Banks              │
├─────────────────────────────────────┤
│ Preset Banks                        │
│ ────────────────────────────────────│
│ ┌──────────┐ ┌──────────┐ ┌──────┐ │
│ │ Bank 1   │ │ Bank 2   │ │ Bank 3│ │
│ │ 8 presets│ │ 0 presets│ │ 2 ... │ │
│ │[Open]    │ │[Open]    │ │[Open] │ │
│ │[Rename]  │ │[Rename]  │ │[Rename]│ │
│ │[Clear]   │ │[Clear]   │ │[Clear] │ │
│ └──────────┘ └──────────┘ └──────┘ │
│                                     │
│ [📥 Import Bank] [📤 Export All]    │
└─────────────────────────────────────┘
```

**Bank Card Actions:**
- **Open**: Switch to this bank and view its presets
- **Rename**: Give the bank a custom name (e.g., "Sunday Service")
- **Clear**: Delete all presets in this bank (with confirmation)

**Modal-Level Actions:**
- **Import Bank**: Load a previously exported bank JSON file
- **Export All**: Download all 5 banks as a single JSON file

### 2. Preset List View

After opening a bank, users see the preset list with bank info at the top:

```
┌─────────────────────────────────────┐
│ [← Back to Banks] Bank 1            │
│                                     │
│ [+ Add New Preset] [📤 Export Bank] │
│ ────────────────────────────────────│
│ ◆ Walk-In Scene        🔑 ID: walkin│
│   🎯 Key: 1            📋 5 steps   │
│   [Edit] [Duplicate]                │
│                                     │
│ ◆ Sermon Scene         🔑 ID: sermon│
│   🎯 Key: 2            📋 3 steps   │
│   [Edit] [Duplicate]                │
│ ...                                 │
└─────────────────────────────────────┘
```

**Preset Actions:**
- **Edit**: Modify presets and macro steps
- **Duplicate**: Copy a preset to the same bank
- **Add New Preset**: Create a fresh preset in this bank
- **Export Bank**: Download this specific bank as JSON

### 3. Preset Edit View

Same as before—edit presets, add/remove macro steps, save changes.

---

## API Endpoints

### Get Banks List
```http
GET /api/banks
```
**Response:**
```json
{
  "ok": true,
  "banks": [
    { "id": 1, "name": "Bank 1", "presetCount": 8, "hasContent": true },
    { "id": 2, "name": "Bank 2", "presetCount": 0, "hasContent": false }
  ],
  "currentBank": 1,
  "maxBanks": 5
}
```

### Load Presets from a Bank
```http
GET /api/presets?bank=1
```
**Response:**
```json
{
  "presets": [...],
  "quickCues": [...],
  "currentBank": 1,
  "bankMetadata": { "currentBank": 1, "bankNames": {...} }
}
```

### Save Presets to a Bank
```http
POST /api/presets?bank=2
Content-Type: application/json

{ "presets": [...], "quickCues": [...] }
```

### Switch to a Bank
```http
POST /api/banks/switch
Content-Type: application/json

{ "bankId": 2 }
```
**Response:**
```json
{
  "ok": true,
  "bank": 2,
  "presets": [...],
  "quickCues": [...]
}
```

### Rename a Bank
```http
POST /api/banks/{id}/rename
Content-Type: application/json

{ "name": "Sunday Service" }
```

### Clear a Bank
```http
POST /api/banks/{id}/clear
```

### Export a Single Bank
```http
GET /api/banks/export/1
```
**Response:**
```json
{
  "exportType": "single_bank",
  "bankId": 1,
  "bankName": "Bank 1",
  "timestamp": "2026-05-11T10:30:00.000Z",
  "data": { "presets": [...], "quickCues": [...] }
}
```

### Export All Banks
```http
GET /api/banks/export/-1
```
**Response:**
```json
{
  "exportType": "all_banks",
  "timestamp": "2026-05-11T10:30:00.000Z",
  "banks": {
    "bank_1": { "name": "Bank 1", "data": {...} },
    "bank_2": { "name": "Bank 2", "data": {...} },
    ...
  }
}
```

### Import Bank
```http
POST /api/banks/import
Content-Type: application/json

{
  "sourceBank": { "presets": [...], "quickCues": [...] },
  "targetBank": 2,
  "overwrite": true
}
```
- `overwrite: true` → Replace all presets in target bank
- `overwrite: false` → Merge presets (skip duplicates by ID)

**Response:**
```json
{
  "ok": true,
  "targetBank": 2,
  "presetCount": 12
}
```

---

## Frontend Implementation

### State Management

The `initPresets()` function now manages:
```javascript
let currentPresets = [];      // Current bank's presets
let currentBank = 1;          // Currently selected bank
let bankMetadata = null;      // Bank names & metadata
let editingPresetIndex = -1;  // Index of preset being edited
let currentMacroSteps = [];   // Current preset's macro steps
```

### View Hierarchy

```
Modal Opens
├── Bank Selector View (showView('banks'))
│   ├── Render all 5 banks with icons/counts
│   ├── Actions: Open, Rename, Clear
│   └── Import/Export All Buttons
│
└── Upon "Open" → switches to bank
    ├── Preset List View (showView('list'))
    │   ├── Shows presets in current bank
    │   ├── Actions: Edit, Duplicate, Add New
    │   ├── Back to Banks, Export Bank
    │   │
    │   └── Upon "Edit" → 
    │       └── Preset Edit View (showView('edit'))
    │           ├── Edit form
    │           ├── Macro step builder
    │           └── Save/Delete/Cancel
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `loadAndRenderBanks()` | Fetch & display all 5 banks |
| `switchBank(bankId)` | Load a bank and switch to it |
| `renameBank(bankId)` | Prompt for new name, save to server |
| `clearBank(bankId)` | Clear presets from a bank (with confirm) |
| `exportBank()` | Download current bank as JSON |
| `exportAllBanks()` | Download all banks as one JSON |
| `importBank()` | File picker → import to selected bank |

---

## Workflow Examples

### Example 1: Multi-Service Setup

**Initial State:** Sunday service presets in Bank 1

**Workflow:**
1. Click **🎛️ Presets** button
2. See banks list with "Bank 1" active
3. Click **Rename** on Bank 2 → enter "Wednesday Service"
4. Click **Import Bank** → select Sunday preset export
5. Choose target bank: **2**
6. Choose merge or overwrite
7. Done! Wednesday presets are now in Bank 2
8. Operators can switch banks with **Open** button

### Example 2: Team Collaboration

**Scenario:** Operator A and B work different days

**Workflow:**
1. Operator A creates presets in Bank 1, exports all banks
2. Shares `showcall-all-presets-*.json` with Operator B
3. Operator B clicks **Import Bank** → selects the file
4. Chooses Bank 1 target (overwrite their draft)
5. Now both have the same bank 1, can add their own to other banks

### Example 3: Backup & Restore

**Workflow:**
1. Click **Export All** → saves all banks locally
2. If data is lost, click **Import Bank**
3. Select the backup file
4. Choose Bank 1, overwrite
5. All presets restored!

---

## Data Schema

### preset-bank-1.json
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
        { "type": "trigger", "layer": 2, "column": 1 },
        { "type": "cut" }
      ]
    }
  ],
  "quickCues": [
    { "label": "Clear All", "action": "clear" },
    { "label": "Cut (Prev→Prog)", "action": "cut" }
  ]
}
```

### presets-metadata.json
```json
{
  "currentBank": 1,
  "bankNames": {
    "1": "Bank 1",
    "2": "Sunday Service",
    "3": "Wednesday Service",
    "4": "Special Events",
    "5": "Backup Bank"
  }
}
```

---

## Migration from Old System

When a user upgrades:

1. **First app launch:**
   - Server checks for `presets.json`
   - If found, it's loaded when bank 1 is requested
   - On next save, data is written to `preset-bank-1.json`
   - `presets-metadata.json` is created with defaults

2. **Backwards compatibility:**
   - Old `/api/presets` calls still work (defaults to bank 1)
   - Legacy code requires no changes

---

## Limits & Constraints

| Limit | Value | Note |
|-------|-------|------|
| Max Banks | 5 | Hardcoded in `server.mjs` |
| Max Bank Name Length | 50 chars | Validated on server |
| Preset IDs | Unique per bank | Can duplicate across banks |
| File Size | No hard limit | Each bank JSON can be large |
| Import Merge | By preset ID | Skips if ID already exists |

---

## Troubleshooting

### "Failed to load banks"
- Check file permissions in user data directory
- Ensure `presets-metadata.json` is readable
- Check server logs for details

### Banks not syncing to Companion
- Verify WebSocket clients are connected
- Check `/api/banks` endpoint responds correctly
- Restart Companion client if needed

### Import shows "Invalid bank ID"
- Ensure target bank is 1-5
- Check if JSON is malformed

### Export shows no file
- Check browser downloads folder
- Allow pop-ups/downloads in browser
- Try different export format

---

## Future Enhancements

Potential improvements:
- [ ] Bank cloud sync
- [ ] Duplicate/copy entire bank
- [ ] Bank-level undo/redo
- [ ] Preset sharing between banks UI (without re-export)
- [ ] Auto-backup on save
- [ ] Compression for large exports

---

## Support

For issues or feature requests, reference this guide and include:
- ShowCall version
- Number of presets/banks
- Steps to reproduce
- Server logs (if available)
