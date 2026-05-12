# Preset Deck Customization Feature

## Overview
The preset popout deck is now highly customizable with a hamburger menu interface allowing users to toggle widgets and personalize their deck experience.

## Key Features

### 1. Customize Menu (Hamburger Button)
- Click the **☰** button in the top-right corner of the deck to open customization options
- Modal dialog with checkbox options to enable/disable features
- Settings persist in browser localStorage as `showcall_deck_settings`

### 2. Customizable Widgets

#### Go Button (Cue Stack Execution)
- **Enabled by default**
- Large green "GO" button that executes the next cue from the cue stack
- Automatically disabled when all cues have been executed
- Visual feedback with gradient design matching production standards

#### Cue Status Display
- Shows current cue progress (e.g., "Ready: Cue 3 of 12")
- Helps operators stay synchronized with the show
- Optional - disabled by default

#### Quick Cues Support
- Placeholder for future integration of quick cue buttons
- Can be enabled/disabled from the customize menu
- Ready for expansion with custom quick actions

### 3. Architecture

#### Frontend (deck.html)
- **Customization Modal**: User-friendly checkbox interface
- **Control Section**: Dynamic rendering of enabled widgets
- **Settings Management**: `deckSettings` object synced with localStorage
- **Cue Stack Integration**: Loads and executes cues via `/api/cuestack` endpoints

#### Backend (server.mjs)
- **`GET /api/cuestack`**: Returns current cue stack state
  - Loads from `cuestack.json` in user data directory
  - Falls back to default empty stack if file doesn't exist
  
- **`POST /api/cuestack/execute`**: Advances to next cue and executes it
  - Increments currentIndex
  - Executes custom cue actions (triggers, columns, etc.)
  - Persists updated state back to `cuestack.json`
  - Returns updated cue stack for UI refresh

### 4. Usage

#### For Users
1. Open the preset deck popout window
2. Click the **☰** button (top-right)
3. Check/uncheck widgets you want to display:
   - **Cue Go Button**: Enable to show the large GO button
   - **Cue Status**: Enable to show progress info
   - **Quick Cues**: Enable for future quick cue actions
4. Click "Done" to save and close
5. Your preferences are remembered next time you open the deck

#### For Developers
The deck customization system is extensible. To add a new widget:

1. Add a checkbox in the modal (deck.html, around line 340)
2. Add setting to `deckSettings` object (line 10)
3. Add enable/disable logic in `applyDeckSettings()` function
4. Update `renderControls()` to render the new widget

## Technical Details

### Settings Persistence
```javascript
// Settings stored in browser localStorage
const deckSettings = {
  showGoButton: true,      // Enabled by default
  showCueStatus: false,    // Disabled by default
  showQuickCues: false     // Disabled by default (for future use)
};

// Auto-saved to localStorage:
localStorage.getItem('showcall_deck_settings')
```

### API Endpoints

#### GET /api/cuestack
**Response:**
```json
{
  "name": "My Show",
  "cues": [
    { "custom": { "label": "Standby", "color": "#6b7280", "actions": [] } },
    { "custom": { "label": "Scene 1", "color": "#ff0000", "actions": [...] } }
  ],
  "currentIndex": -1
}
```

#### POST /api/cuestack/execute
**Response:**
```json
{
  "name": "My Show",
  "cues": [...],
  "currentIndex": 0,
  "message": "Cue #0 executed"
}
```

### Cue Stack State File
**Location:** `~/Library/Application Support/ShowCall/cuestack.json` (macOS)

The server synchronizes cue stack state with this file, allowing persistence across sessions.

## Future Enhancements

1. **Quick Cues in Deck**: Enable quick cue buttons to appear in the deck
2. **Layout Customization**: Allow users to choose grid layouts (1, 2, or 3 columns)
3. **Size Customization**: Adjustable button sizes
4. **Color Themes**: Dark/light mode toggle
5. **Widget Reordering**: Drag-and-drop to customize widget order
6. **Cue Stack Control**: Show full cue list with jump-to-cue capability
7. **Remote Control**: Access deck customization from main window

## Notes

- Settings are stored per-browser instance (localStorage)
- If using multiple machines, settings sync via cloud storage or manual export
- Customization is non-destructive; all features still work via main app
- GO button is keyboard-accessible (future: add keyboard shortcut like Space or Enter)
