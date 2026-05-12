# Preset Banks - Quick Reference

## 🚀 Quick Start

### For End Users

1. **Open Presets Modal**
   - Click 🎛️ **Presets** button in top bar

2. **See Your Banks**
   - 5 bank cards displayed
   - Shows preset count for each
   - Green highlight = current bank

3. **Switch Banks**
   - Click **Open** on any bank card
   - Presets for that bank load
   - Deck updates automatically

4. **Rename a Bank**
   - Click **Rename** on bank card
   - Enter new name (e.g., "Sunday Service")
   - Name persists

5. **Create Preset in Current Bank**
   - Click **+ Add New Preset**
   - Create as usual
   - Saves only to this bank

6. **Export Bank**
   - From preset list: Click **📤 Export Bank** 
   - Get JSON file with that bank's presets
   - Share or backup

7. **Export All Banks**
   - From bank selector: Click **📤 Export All Banks**
   - Get JSON with all 5 banks
   - Backup everything at once

8. **Import Bank**
   - From bank selector: Click **📥 Import Bank**
   - Pick JSON file
   - Choose target bank (1-5)
   - Choose merge or overwrite
   - Done!

---

## 🔧 API Reference

### Quick API Calls

| Action | Endpoint | Method |
|--------|----------|--------|
| List all banks | `GET /api/banks` | GET |
| Load Bank 2 presets | `GET /api/presets?bank=2` | GET |
| Save to Bank 3 | `POST /api/presets?bank=3` | POST |
| Switch to Bank 1 | `POST /api/banks/switch` | POST |
| Rename Bank 2 | `POST /api/banks/2/rename` | POST |
| Clear Bank 3 | `POST /api/banks/3/clear` | POST |
| Export Bank 1 | `GET /api/banks/export/1` | GET |
| Export ALL | `GET /api/banks/export/-1` | GET |
| Import to Bank 2 | `POST /api/banks/import` | POST |

### Example: Switch to Bank 2

```bash
curl -X POST http://localhost:3200/api/banks/switch \
  -H "Content-Type: application/json" \
  -d '{"bankId": 2}'
```

### Example: Export Bank 1

```bash
curl http://localhost:3200/api/banks/export/1 > bank1.json
```

### Example: Import with Merge

```bash
curl -X POST http://localhost:3200/api/banks/import \
  -H "Content-Type: application/json" \
  -d '{
    "sourceBank": {"presets": [...]},
    "targetBank": 2,
    "overwrite": false
  }'
```

---

## 📁 File Locations

### Data Files (per OS)

**macOS:**
```
~/Library/Application Support/ShowCall/
```

**Windows:**
```
%AppData%\Roaming\ShowCall\
```

**Linux:**
```
~/.showcall/
```

### File Names

```
preset-bank-1.json        ← Bank 1 presets
preset-bank-2.json        ← Bank 2 presets
preset-bank-3.json        ← Bank 3 presets
preset-bank-4.json        ← Bank 4 presets
preset-bank-5.json        ← Bank 5 presets
presets-metadata.json     ← Bank names & settings
```

---

## 💡 Use Cases

### Scenario 1: Different Services

```
Bank 1: "Sunday Morning"   (10 presets)
Bank 2: "Wednesday Night"  (8 presets)
Bank 3: "Special Events"   (5 presets)
Bank 4: Empty
Bank 5: "Backup"
```

Switch banks before each service.

### Scenario 2: Team Collaboration

```
Operator A → Bank 1 (her presets)
Operator B → Bank 2 (his presets)
Both share Bank 3 (common presets)
```

Each operator maintains their own bank.

### Scenario 3: Backup Strategy

```
1. Create presets in Bank 1
2. Click "Export All" → get bank1-backup-2026-05-11.json
3. Store file in cloud or USB
4. If disaster: Import the backup
```

### Scenario 4: Venue Sharing

```
Main Room:   Use Bank 1
Side Room:   Use Bank 2
Setup Room:  Use Bank 3
```

Each room has its own preset set.

---

## ⚡ Hotkeys

**All hotkeys work in current bank only.**

Example:
- Bank 1 has preset "Walk-In" on key **1**
- Bank 2 has different preset on key **1**
- Key press fires the preset from current bank

---

## ❌ Common Mistakes

### ❌ Don't
- Edit a preset, assume it saved to all banks (it only saves to current bank)
- Expect preset ID "sermon" in Bank 1 to auto-exist in Bank 2
- Forget to export before clearing a bank

### ✅ Do
- Name your banks clearly (e.g., "Sunday Service" not "Bank 1")
- Export before experimenting with clear/delete
- Use import/merge to copy presets between banks
- Switch banks to verify data is in the right place

---

## 🆘 Troubleshooting

### Problem: Can't see Bank 2 presets after switching

**Solution:**
- Click "Open" on Bank 2 to switch
- Verify preset list loads
- Check browser console for errors

### Problem: Export creates blank file

**Solution:**
- Check file downloaded correctly
- Try export again
- Ensure bank has presets (export empty bank works too, just shows 0 presets)

### Problem: Import says "Invalid bank ID"

**Solution:**
- Choose bank 1-5 (not 0, not 6)
- Ensure number is valid
- Try import again

### Problem: Can't rename bank

**Solution:**
- Name must be 1-50 characters
- No special characters
- Try a simpler name (e.g., "Service A")

### Problem: Presets disappeared after import

**Solution:**
- Check if you chose "overwrite" (overwrites old presets)
- Use "merge" to keep both sets
- Check other banks—presets might be there
- Try reimporting from backup

---

## 📊 Data Examples

### Bank Export Format (Single Bank)

```json
{
  "exportType": "single_bank",
  "bankId": 1,
  "bankName": "Sunday Service",
  "timestamp": "2026-05-11T15:30:00.000Z",
  "data": {
    "presets": [
      {
        "id": "walkin",
        "label": "Walk-In Scene",
        "color": "#0ea5e9",
        "hotkey": "1",
        "macro": [...]
      }
    ],
    "quickCues": [...]
  }
}
```

### Bank Export Format (All Banks)

```json
{
  "exportType": "all_banks",
  "timestamp": "2026-05-11T15:30:00.000Z",
  "banks": {
    "bank_1": {
      "name": "Bank 1",
      "data": {...}
    },
    "bank_2": {
      "name": "Sunday Service",
      "data": {...}
    },
    ...
  }
}
```

---

## 🔑 Key Points

| Concept | Details |
|---------|---------|
| **Max Banks** | 5 |
| **Switching** | Instant, loads presets from new bank |
| **Presets per Bank** | Unlimited (practical: ~100) |
| **Unique IDs** | Per bank (can repeat across banks) |
| **Export** | JSON format, portable |
| **Import** | File upload, merge or overwrite |
| **Hotkeys** | Work in current bank |
| **Deck Window** | Shows current bank's presets |
| **Auto-Save** | Each bank saves independently |

---

## 📞 Support

For help:
1. Read `docs/PRESET_BANKS_GUIDE.md` (detailed)
2. Check this quick ref
3. Try export/import as backup
4. Restart app if confused
5. Contact admin with export file

---

## 🎯 TL;DR

- **5 independent banks** = 5 different preset sets
- **Switch** with "Open" button
- **Export** for backup/sharing
- **Import** to restore or merge
- **All features** work in current bank
- **No data loss** - exports are backups
