# Preset Banks - Code Location Reference

## Quick Navigation Guide

### 🔧 Backend Changes (server.mjs)

| Feature | Location | Lines | Details |
|---------|----------|-------|---------|
| Bank path helpers | Top of file | ~10 | `getBankPath()`, `getMetadataPath()` |
| Metadata helpers | After helpers | ~50 | `loadBankMetadata()`, `saveBankMetadata()` |
| Bank loaders | After metadata | ~30 | `loadBank()`, `saveBank()` |
| Updated `/api/presets` GET | Line ~560 | ~30 | Now bank-aware with query param |
| Updated `/api/presets` POST | Line ~590 | ~40 | Saves to specific bank |
| **NEW:** `/api/banks` | Line ~640 | ~20 | List all banks |
| **NEW:** `/api/banks/switch` | Line ~660 | ~15 | Switch to bank |
| **NEW:** `/api/banks/:id/rename` | Line ~680 | ~20 | Rename bank |
| **NEW:** `/api/banks/:id/clear` | Line ~705 | ~12 | Clear bank |
| **NEW:** `/api/banks/export/:id` | Line ~720 | ~35 | Export single/all |
| **NEW:** `/api/banks/import` | Line ~760 | ~45 | Import with merge logic |

### 🎨 Frontend HTML Changes (index.html)

| Feature | Location | Details |
|---------|----------|---------|
| Bank selector view | Line ~171 | New `<div id="bankSelectorView">` |
| Bank list container | Line ~176 | `<div id="bankList">` |
| Back to banks button | Line ~177 | `<button id="backToBankSelectorBtn">` |
| Current bank display | Line ~192 | `<span id="currentBankName">` |
| Bank action buttons | Line ~197 | Import/Export buttons |
| Export bank button | Line ~207 | Single bank export |

### 💻 Frontend JavaScript Changes (app.js)

| Feature | Location | Lines | Details |
|---------|----------|-------|---------|
| New state vars | Line ~1245 | ~10 | `currentBank`, `bankMetadata` |
| `showView()` | Line ~1280 | ~10 | View switcher (banks/list/edit) |
| `loadAndRenderBanks()` | Line ~1300 | ~15 | Fetch & display banks |
| `renderBankList()` | Line ~1320 | ~50 | Render bank cards |
| `switchBank()` | Line ~1380 | ~20 | Switch to bank |
| `renameBank()` | Line ~1410 | ~15 | Rename bank |
| `clearBank()` | Line ~1430 | ~12 | Clear bank presets |
| Updated `openModal()` | Line ~1450 | ~8 | Now calls `loadAndRenderBanks()` |
| Updated `renderPresetList()` | Line ~1490 | ~50 | Bank context aware |
| Updated `savePreset()` | Line ~1700 | ~50 | Bank param in URL |
| Updated `deletePreset()` | Line ~1760 | ~50 | Bank param in URL |
| `exportBank()` | Line ~1830 | ~20 | Export current bank |
| `exportAllBanks()` | Line ~1860 | ~20 | Export all banks |
| `importBank()` | Line ~1890 | ~45 | File import logic |
| Event listeners | Line ~1950 | ~15 | New button handlers |

### 🎨 Frontend CSS Changes (styles.css)

| Feature | Location | Lines | Details |
|---------|----------|-------|---------|
| Bank selector styles | Line ~1309 | ~60 | Container, grid layout |
| Bank item styles | Line ~1345 | ~80 | Card design, active state |
| Bank actions styles | Line ~1425 | ~30 | Button styling |
| Updated preset list header | Line ~1465 | ~40 | Bank context display |
| Export/Import buttons | Line ~1475 | ~15 | Button styling |

---

## Key Function Signatures

### Backend (server.mjs)

```javascript
// Helpers
getBankPath(bankId = 1)                        // Returns file path
getMetadataPath()                              // Returns metadata file path
loadBankMetadata()                             // Async, returns metadata object
saveBankMetadata(metadata)                     // Async, saves metadata
loadBank(bankId = 1)                           // Async, returns bank data
saveBank(bankId, data)                         // Async, saves to file

// Endpoints
app.get('/api/banks')                          // List all banks
app.post('/api/banks/switch')                  // Switch to bank
app.post('/api/banks/:id/rename')              // Rename bank
app.post('/api/banks/:id/clear')               // Clear bank
app.get('/api/banks/export/:id')               // Export bank(s)
app.post('/api/banks/import')                  // Import bank
```

### Frontend (app.js)

```javascript
// State
let currentBank = 1;                           // Active bank
let bankMetadata = null;                       // All bank info

// Functions
showView(view)                                 // 'banks' | 'list' | 'edit'
loadAndRenderBanks()                           // Fetch & display
renderBankList(banks)                          // Render cards
switchBank(bankId)                             // Switch to bank
renameBank(bankId)                             // Rename
clearBank(bankId)                              // Clear presets
exportBank()                                   // Export current
exportAllBanks()                               // Export all
importBank()                                   // Import from file

// Updated
savePreset()                                   // Now bank-aware
deletePreset()                                 // Now bank-aware
openModal()                                    // Now shows banks first
renderPresetList()                             // Now bank-scoped
```

---

## File Structure

```
/Users/trevormarr/Apps/showcall/
├── server.mjs                          (MODIFIED - backend)
├── public/
│   ├── app.js                          (MODIFIED - frontend logic)
│   ├── index.html                      (MODIFIED - UI structure)
│   └── styles.css                      (MODIFIED - styling)
└── docs/
    ├── PRESET_BANKS_GUIDE.md           (NEW - user guide)
    ├── PRESET_BANKS_QUICK_REF.md       (NEW - quick reference)
    └── PRESET_BANKS_VISUAL.md          (NEW - diagrams)
└── PRESET_BANKS_IMPLEMENTATION.md      (NEW - dev notes)
└── PRESET_BANKS_SUMMARY.md             (NEW - this summary)
```

---

## Searching Tips

### Find Bank-Related Code

```bash
# All functions handling banks
grep -n "Bank\|bank" app.js | grep -i "function\|const"

# All API endpoints
grep -n "app\.\(get\|post\)" server.mjs | grep "bank"

# All HTML bank elements
grep -n "bank\|Bank" index.html

# All bank-related styles
grep -n "\.bank-" styles.css
```

### Common Search Patterns

| Find | Search |
|------|--------|
| Bank switching | `switchBank` |
| Export functions | `export.*Bank` |
| Import logic | `importBank` |
| Bank metadata | `bankMetadata\|bankNames` |
| View switching | `showView` |
| Bank list rendering | `renderBankList` |

---

## API Endpoints Quick Reference

```bash
# List banks
GET /api/banks
Response: { banks: [...], currentBank, maxBanks }

# Load bank's presets
GET /api/presets?bank=2
Response: { presets: [...], currentBank, bankMetadata }

# Save to bank
POST /api/presets?bank=2
Body: { presets: [...], quickCues: [...] }
Response: { ok: true, bank: 2 }

# Switch bank
POST /api/banks/switch
Body: { bankId: 3 }
Response: { ok: true, bank: 3, presets: [...] }

# Rename bank
POST /api/banks/2/rename
Body: { name: "Sunday Service" }
Response: { ok: true, bank: 2, name }

# Clear bank
POST /api/banks/3/clear
Response: { ok: true, bank: 3, message }

# Export single
GET /api/banks/export/2
Response: { exportType: "single_bank", bankId, data }

# Export all
GET /api/banks/export/-1
Response: { exportType: "all_banks", banks }

# Import
POST /api/banks/import
Body: { sourceBank: {...}, targetBank: 2, overwrite: false }
Response: { ok: true, targetBank: 2, presetCount }
```

---

## State Flow

```
initPresets() {
  // ...initialization...
  
  let currentBank = 1;              // Track active bank
  let bankMetadata = null;          // Holds all bank names
  
  // On modal open:
  openModal() {
    loadAndRenderBanks()            // Fetch all banks
    showView('banks')               // Show selector
  }
  
  // On click [Open] Bank 2:
  switchBank(2) {
    POST /api/banks/switch
    currentBank = 2
    showView('list')                // Switch to preset list
  }
  
  // When editing:
  savePreset() {
    POST /api/presets?bank=2        // Save to current bank
    buildDeck()                     // Refresh UI
  }
  
  // Events:
  backToBankSelectorBtn.onclick → showView('banks')
  exportBankBtn.onclick → exportBank()
  importBankBtn.onclick → importBank()
}
```

---

## Session Lifecycle

```
APP START
  ├─ Load presets.json (legacy check)
  ├─ Create preset-bank-*.json if needed
  └─ Load presets-metadata.json
     └─ currentBank = metadata.currentBank
  
USER CLICKS 🎛️ PRESETS
  ├─ initPresets() runs
  ├─ loadAndRenderBanks() called
  ├─ showView('banks')
  └─ User sees all 5 banks
  
USER CLICKS [OPEN] BANK 3
  ├─ switchBank(3)
  ├─ currentBank = 3
  ├─ Load preset-bank-3.json
  ├─ showView('list')
  └─ User sees Bank 3 presets
  
USER EDITS/ADDS PRESET
  ├─ savePreset() called
  ├─ POST /api/presets?bank=3
  ├─ Server writes to preset-bank-3.json
  └─ Only Bank 3 affected
  
USER SWITCHES TO BANK 1
  ├─ switchBank(1)
  ├─ currentBank = 1
  ├─ Load preset-bank-1.json
  └─ Bank 3 changes preserved
  
APP CLOSE
  └─ presets-metadata.json saved with currentBank
  
APP RESTART
  └─ Loads metadata.currentBank → Shows same bank user was on
```

---

## Testing Hooks

### Unit Test Points

```javascript
// Test bank path generation
getBankPath(1) === '~/.showcall/preset-bank-1.json'
getBankPath(6) === '~/.showcall/preset-bank-5.json' // clamps to 5

// Test metadata load/save
loadBankMetadata() // returns object with currentBank, bankNames
saveBankMetadata({...}) // writes file

// Test bank operations
loadBank(1) // returns presets array
saveBank(1, {...}) // writes file
switchBank(2) // updates metadata + state

// Test view switching
showView('banks') // shows bank selector
showView('list') // shows preset list
showView('edit') // shows edit form

// Test export/import
exportBank() // creates blob, triggers download
importBank() // file picker + parse JSON
```

### Integration Test Points

```javascript
// Flow: Create bank, add preset, export, import
1. switchBank(1)
2. savePreset({id: 'test', ...})
3. exportBank() → save JSON
4. importBank() with saved JSON to Bank 2
5. switchBank(2)
6. Verify preset exists

// Flow: Merge vs Overwrite
1. switchBank(2) with 3 existing presets
2. Import JSON with 2 new + 1 duplicate ID
3. Test merge: Should have 5 total
4. Test overwrite: Should have 3 total
```

---

## Performance Monitoring

### Metrics to Track

```javascript
// Bank load time
const start = performance.now();
switchBank(2);
const duration = performance.now() - start;
console.log(`Bank switch: ${duration}ms`);

// Render time
renderBankList(banks)
renderPresetList()

// File size
const jsonSize = JSON.stringify(bank).length;
console.log(`Bank size: ${jsonSize} bytes`);

// API response time
fetch('/api/banks')
  .then(r => { 
    console.log(`Banks API: ${performance.now()}ms`) 
  })
```

---

## Common Edits

### Add a New Bank Operation

1. **Server** (`server.mjs`):
   ```javascript
   app.post('/api/banks/action', async (req, res) => {
     // Implement action
   });
   ```

2. **Frontend** (`app.js`):
   ```javascript
   const doAction = async () => {
     const res = await fetch('/api/banks/action', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({...})
     });
     loadAndRenderBanks(); // Refresh
   };
   ```

3. **HTML** (`index.html`):
   ```html
   <button id="actionBtn" class="btn-secondary">Action</button>
   ```

4. **Event** (`app.js`):
   ```javascript
   actionBtn.onclick = doAction;
   ```

### Change Max Banks

1. **server.mjs**: Change `const MAX_PRESET_BANKS = 5;`
2. **app.js**: No changes needed (dynamic)
3. **HTML**: No changes needed (renders all banks)
4. **Test**: Import/export, bank validation

### Increase Bank Name Length

1. **server.mjs**: Change validation `name.length > 50` to desired max
2. **HTML**: Update input `maxlength` attribute if shown
3. **CSS**: May need to adjust card width/text overflow
4. **Test**: Long names don't break layout

---

## Debugging Tips

### Check Bank State

```javascript
// In browser console
console.log(currentBank);           // Current bank ID
console.log(currentPresets);        // Presets in bank
console.log(bankMetadata);          // All bank names
```

### Check Files

```bash
# View bank files
cat ~/.showcall/preset-bank-1.json
cat ~/.showcall/presets-metadata.json

# Verify JSON syntax
jq empty ~/.showcall/preset-bank-1.json && echo "Valid"
```

### Check Network

```javascript
// Monitor API calls
fetch('/api/banks').then(r => r.json()).then(console.log)

// Check response
fetch('/api/presets?bank=2').then(r => r.json()).then(console.log)
```

### Common Issues

| Issue | Debug |
|-------|-------|
| Bank not switching | Check `currentBank` var, network tab |
| Export shows blank | Check `bankMetadata` populated |
| Import fails | Check JSON format, target bank ID |
| Presets not saving | Check network tab, file permissions |

---

## Reference Summary

- **Total Code Added**: ~1,250 lines
- **New Endpoints**: 6
- **Modified Endpoints**: 2
- **New Functions**: 8+
- **Documentation Files**: 4
- **All backwards compatible**: ✅
- **Zero breaking changes**: ✅

Everything is ready for deployment and testing!
