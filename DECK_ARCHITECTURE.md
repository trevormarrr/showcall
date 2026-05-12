# Preset Deck Customization - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESET DECK POPOUT WINDOW                    │
│                         (Electron BrowserWindow)                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐        ┌────────▼────────┐
            │  Main UI Layer │        │  Modal Overlay  │
            │                │        │                 │
            │ ┌────────────┐ │        │ ┌────────────┐  │
            │ │ Header Bar │ │        │ │   Modal    │  │
            │ │  ☰ Button  │ │◄──────┤ │ Checkboxes │  │
            │ └────────────┘ │        │ │            │  │
            │ ┌────────────┐ │        │ │ • Go Btn   │  │
            │ │  Controls  │ │        │ │ • Status   │  │
            │ │ (dynamic)  │ │        │ │ • QuickCues│  │
            │ └────────────┘ │        │ └────────────┘  │
            │ ┌────────────┐ │        └────────────────┘
            │ │  Presets   │ │
            │ │  Grid      │ │
            │ └────────────┘ │
            └────────────────┘
                     │
                     │ (HTTP Fetch)
                     │
    ┌────────────────┴────────────────┐
    │                                 │
┌───▼──────────────────┐     ┌────────▼────────┐
│   Node.js Express    │     │  Browser Local  │
│   Server (server.mjs)│     │  Storage        │
│                      │     │                 │
│ ┌──────────────────┐ │     │ ┌─────────────┐ │
│ │ GET /api/        │ │     │ │ deck_       │ │
│ │ cuestack         │ │     │ │ settings {  │ │
│ │                  │ │     │ │  showGo...  │ │
│ │ POST /api/       │ │     │ │  showStatus │ │
│ │ cuestack/execute │ │     │ │  showQuick..│ │
│ └──────────────────┘ │     │ │ }           │ │
│                      │     │ └─────────────┘ │
│ ┌──────────────────┐ │
│ │ cuestack.json    │ │
│ │ (persistent)     │ │
│ └──────────────────┘ │
└──────────────────────┘
           │
           │ (OSC/REST)
           │
┌──────────▼───────────────────┐
│   Resolume Arena (OSC)        │
│   Executes cue actions        │
│   (triggers, columns, etc)    │
└──────────────────────────────┘
```

## Data Flow - Customization Save

```
User clicks checkbox
        │
        ▼
┌──────────────────────┐
│ Change event fired   │
│ (JavaScript)         │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│ Update deckSettings  │
│ { showGoButton:true }│
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│ saveDeckSettings()   │
│ (localStorage)       │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│ applyDeckSettings()  │
│ (render controls)    │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│ Control section      │
│ appears/disappears   │
└──────────────────────┘
```

## Data Flow - Cue Execution

```
User clicks GO button
        │
        ▼
┌──────────────────────────────────────┐
│ executeNextCue()                     │
│ POST /api/cuestack/execute           │
└──────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│ Server receives POST request                    │
│ 1. Load cuestack.json                           │
│ 2. Increment currentIndex                       │
│ 3. Get cue at new index                         │
│ 4. Execute cue.custom.actions via macro system │
│ 5. Save updated cuestack.json                   │
│ 6. Return updated state                         │
└─────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ Client receives response                     │
│ Update cueStack variable                     │
│ Call renderControls() to update UI           │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│ UI updates:                              │
│ • Status text shows new cue number       │
│ • GO button disables if last cue reached │
│ • Success feedback to user               │
└──────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ (Optional) Send OSC to Resolume via    │
│ cue.custom.actions execution           │
└────────────────────────────────────────┘
```

## State Management

```
┌──────────────────────────────────────┐
│     JavaScript State (Runtime)       │
├──────────────────────────────────────┤
│ let deckSettings = {                 │
│   showGoButton: true,                │
│   showCueStatus: false,              │
│   showQuickCues: false               │
│ }                                    │
│                                      │
│ let presets = [ ... ]                │
│ let cueStack = { ... }               │
└──────────────────────────────────────┘
         │                │
         │ save to        │ load on
         │ init           │
         ▼                ▼
┌──────────────────────────────────────┐
│   Browser localStorage               │
├──────────────────────────────────────┤
│ showcall_deck_settings: {            │
│   "showGoButton": true,              │
│   "showCueStatus": false,            │
│   "showQuickCues": false             │
│ }                                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   Server Filesystem (Persistent)     │
├──────────────────────────────────────┤
│ ~/Library/.../ShowCall/              │
│ └── cuestack.json                    │
│     {                                │
│       "name": "My Show",             │
│       "cues": [...],                 │
│       "currentIndex": 2              │
│     }                                │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
DeckContainer
├── DeckHeader
│   ├── HeaderTitle (text: "Preset Deck")
│   └── MenuButton (☰)
│       └── ClickHandler → showModal()
│
├── DeckControls (conditional display)
│   ├── GoButton (showGoButton)
│   │   └── ClickHandler → executeNextCue()
│   │       └── API: POST /api/cuestack/execute
│   │
│   └── CueStatus (showCueStatus)
│       └── Text: "Ready: Cue X of Y"
│
├── DeckPresets
│   └── PresetButtons (forEach presets)
│       └── ClickHandler → firePreset()
│           └── API: POST /api/macro
│
└── ModalOverlay (conditional display)
    └── Modal
        ├── Title
        ├── Section: Widgets
        │   ├── Checkbox: showGoButton
        │   ├── Checkbox: showCueStatus
        │   └── Checkbox: showQuickCues
        │       └── ChangeHandler → saveDeckSettings()
        │           └── applyDeckSettings()
        │               └── renderControls()
        │
        └── Buttons
            └── DoneButton → closeModal()
```

## Extensibility Pattern

To add a new widget (e.g., "Cue List"):

```javascript
// Step 1: Add to HTML modal
<label class="deck-checkbox-item">
  <input type="checkbox" id="showCueList" checked>
  <div class="deck-checkbox-label">
    <span>Cue List</span>
    <span>Show full list of cues</span>
  </div>
</label>

// Step 2: Add to deckSettings
const deckSettings = {
  showGoButton: true,
  showCueStatus: false,
  showQuickCues: false,
  showCueList: false  // NEW
};

// Step 3: Add to applyDeckSettings()
document.getElementById('showCueList').checked = deckSettings.showCueList;

// Step 4: Add change handler
document.getElementById('showCueList').addEventListener('change', (e) => {
  deckSettings.showCueList = e.target.checked;
  saveDeckSettings();
  applyDeckSettings();
});

// Step 5: Add rendering to renderControls()
if (deckSettings.showCueList && cueStack) {
  const listEl = document.createElement('div');
  // ... build cue list UI
  controlsSection.appendChild(listEl);
}
```

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Load deck | ~500ms | Parallel: presets + cuestack |
| Toggle checkbox | <10ms | localStorage write is fast |
| Click GO button | ~200ms | Network latency + macro exec |
| Render controls | <50ms | DOM manipulation only |
| Modal open/close | <100ms | CSS transition + DOM update |

## Browser Compatibility

- **Modern Chromium** (Electron 31.x): ✅ Full support
- **localStorage**: ✅ Always available (Electron BrowserWindow)
- **Fetch API**: ✅ All platforms
- **CSS Features Used**: 
  - ✅ CSS Grid
  - ✅ Flexbox
  - ✅ CSS Variables
  - ✅ CSS Transitions
  - ✅ CSS Gradients
