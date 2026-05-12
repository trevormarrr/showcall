# Preset Banks Feature - Implementation Summary

## What Was Added

A complete preset banks system allowing users to manage up to 5 independent preset banks, with full import/export functionality.

---

## File Changes

### Backend (server.mjs)

**New Constants:**
```javascript
const MAX_PRESET_BANKS = 5;
function getBankPath(bankId = 1) { ... }      // Returns path to preset-bank-{id}.json
function getMetadataPath() { ... }            // Returns path to presets-metadata.json
```

**New Helper Functions:**
- `loadBankMetadata()` - Load bank names and current bank selection
- `saveBankMetadata(metadata)` - Persist bank metadata
- `loadBank(bankId)` - Load a specific bank's presets
- `saveBank(bankId, data)` - Save to a specific bank

**Updated Endpoints:**
- `GET /api/presets` - Now accepts `?bank=1-5` query param
- `POST /api/presets` - Now accepts `?bank=1-5` query param

**New Endpoints:**
- `GET /api/banks` - List all 5 banks with metadata
- `POST /api/banks/switch` - Switch to a bank
- `POST /api/banks/:id/rename` - Rename a bank
- `POST /api/banks/:id/clear` - Clear a bank
- `GET /api/banks/export/:id` - Export single bank (id=-1 for all)
- `POST /api/banks/import` - Import a bank with merge/overwrite options

**Backwards Compatibility:**
- Old `presets.json` auto-imports to Bank 1
- Legacy API calls default to bank 1

---

### Frontend HTML (index.html)

**New Modal Structure:**
```html
<div id="bankSelectorView">            <!-- First screen: view/manage all banks -->
  <div id="bankList"></div>             <!-- Grid of 5 banks -->
  <div class="bank-actions">            <!-- Import/Export All buttons -->
</div>

<div id="presetListView">              <!-- Updated: now shows current bank name -->
  <div class="bank-header-top">        <!-- Back button + bank name -->
  <div class="preset-list-header-actions">  <!-- Add + Export Bank -->
</div>
```

**New Elements:**
- Bank selector cards with Open/Rename/Clear actions
- "Back to Banks" button in preset list
- "Export Bank" button next to "Add New Preset"
- Import Bank button at bank level

---

### Frontend JavaScript (public/app.js)

**New State Variables in `initPresets()`:**
```javascript
let currentBank = 1;                    // Currently selected bank
let bankMetadata = null;                // All bank names & metadata
```

**New Functions:**
- `showView(view)` - Switch between banks/list/edit views
- `loadAndRenderBanks()` - Fetch and display all banks
- `renderBankList(banks)` - Render bank cards with actions
- `switchBank(bankId)` - Load a bank and its presets
- `renameBank(bankId)` - Prompt for new name
- `clearBank(bankId)` - Clear all presets in bank
- `exportBank()` - Download current bank as JSON
- `exportAllBanks()` - Download all banks as one file
- `importBank()` - File picker and import logic

**Updated Functions:**
- `savePreset()` - Now posts to `/api/presets?bank=${currentBank}`
- `deletePreset()` - Now posts to `/api/presets?bank=${currentBank}`
- `openModal()` - Now calls `loadAndRenderBanks()` first
- All preset operations are now bank-scoped

**View Navigation:**
- `openModal()` → shows bank selector
- Click "Open" on bank → loads that bank's presets
- Click "Back to Banks" → back to selector
- Click preset "Edit" → edit view
- Click "Cancel"/"Back to List" → back to list

---

### Frontend CSS (public/styles.css)

**New Styles:**
- `.bank-selector-view` - Container for bank grid
- `.bank-list` - CSS grid layout (5 banks, responsive)
- `.bank-item` - Individual bank card
- `.bank-item.active` - Highlight current bank
- `.bank-item-actions` - Open/Rename/Clear buttons
- `.bank-actions` - Import/Export buttons
- `.bank-header-top` - Back button + bank name in preset list
- `.preset-list-header-actions` - Add Preset + Export Bank
- `.current-bank-name` - Accent-colored bank name display

**Enhanced Existing Styles:**
- `.preset-list-view` - Now with bank context
- `.preset-list-header` - Reorganized for bank display

---

## Data Structure

### File Storage

Each bank is a separate JSON:
```
~/Library/Application Support/ShowCall/
  ├── preset-bank-1.json
  ├── preset-bank-2.json
  ├── preset-bank-3.json
  ├── preset-bank-4.json
  ├── preset-bank-5.json
  └── presets-metadata.json
```

### Metadata File (presets-metadata.json)
```json
{
  "currentBank": 1,
  "bankNames": {
    "1": "Bank 1",
    "2": "Bank 2",
    "3": "Bank 3",
    "4": "Bank 4",
    "5": "Bank 5"
  }
}
```

### Bank File (preset-bank-X.json)
Same structure as before:
```json
{
  "presets": [...],
  "quickCues": [...]
}
```

---

## User Workflow

### Initial Experience
1. Open Presets modal
2. See 5 bank cards (most empty)
3. Click "Open" on Bank 1 (has default presets from migration)
4. Edit/manage presets as before
5. Can now rename banks, create presets in different banks

### Multi-Bank Setup
1. Create presets in Bank 1
2. Rename Bank 2 to "Alt Service"
3. Create different presets in Bank 2
4. Operators can switch with "Open" button
5. Export/Import for sharing or backup

### Export/Import Flow
- **Export**: Click "Export Bank" or "Export All" → JSON file downloads
- **Import**: Click "Import Bank" → file picker → choose target bank → merge or overwrite
- Use for backup, team collaboration, or venue sharing

---

## API Contract

All requests accept `?bank=1-5` parameter (defaults to 1).

### Breaking Changes
**None.** All changes are backwards compatible:
- Old `/api/presets` still works (uses bank 1)
- Old `presets.json` is auto-loaded
- Existing integrations continue unchanged

### New Capabilities
- Switch between 5 independent preset sets
- Export/import for backup or sharing
- Rename banks for clarity
- Clear banks with one action

---

## Testing Checklist

- [ ] Load app → default to Bank 1
- [ ] Old `presets.json` loads in Bank 1
- [ ] Switch between banks → presets change
- [ ] Rename bank → name persists on reload
- [ ] Add preset in Bank 1 → save → switch to Bank 2 → no preset visible
- [ ] Export Bank → JSON downloads correctly
- [ ] Export All → JSON includes all 5 banks
- [ ] Import single bank → file picker works → presets import
- [ ] Import with merge → duplicates skip, new ones added
- [ ] Import with overwrite → old presets gone
- [ ] Clear bank → confirm dialog → presets deleted
- [ ] Hotkeys work in current bank
- [ ] Deck window loads current bank's presets
- [ ] Companion integration broadcasts bank changes

---

## Performance Considerations

- **Lazy Loading**: Banks only loaded when opened
- **Metadata Caching**: Bank names cached in memory during session
- **File I/O**: Each save writes only to one bank's file
- **Network**: WebSocket broadcasts include bank ID

No performance degradation expected.

---

## Known Limitations

- Max 5 banks (hardcoded, could be increased)
- Preset IDs must be unique per bank (not globally)
- Import merge uses preset ID for deduplication
- No cross-bank preset copying UI (yet)

---

## Deployment Notes

### For Users
No action needed. Existing presets auto-migrate to Bank 1.

### For Admins
- Presets now stored in 5 files instead of 1
- Backup script should include all `preset-bank-*.json` files
- `presets-metadata.json` is required for bank names

### For Integrations
- If accessing presets via API, add `?bank=1` to stay compatible
- New integrations can use `/api/banks` to list available banks
- Export endpoint useful for backup/sync scenarios

---

## Support & Docs

See `docs/PRESET_BANKS_GUIDE.md` for:
- Detailed UI walkthrough
- API documentation
- Use case examples
- Troubleshooting
- Migration guide
- Future enhancement ideas

---

## Summary of Additions

| Item | Scope | Lines |
|------|-------|-------|
| Backend Helpers | server.mjs | ~50 |
| Backend Endpoints | server.mjs | ~250 |
| Frontend State | app.js | ~5 |
| Frontend Functions | app.js | ~200 |
| Frontend Events | app.js | ~10 |
| HTML Structure | index.html | ~30 |
| CSS Styles | styles.css | ~200 |
| Documentation | PRESET_BANKS_GUIDE.md | ~500 |
| **Total** | **~1,245** | |

All code follows existing ShowCall conventions and maintains backwards compatibility.
