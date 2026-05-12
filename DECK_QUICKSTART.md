# Quick Start: Preset Deck Customization

## For End Users

### Opening the Customize Menu

1. Open your **Preset Deck** popout window (from main ShowCall app)
2. Look for the **☰** (hamburger menu) button in the top-right corner
3. Click it to open the customize menu

### Enabling/Disabling Widgets

The customize menu shows three options:

#### 🎯 Cue Go Button
- **Default**: ✅ Enabled
- **Purpose**: Shows a large green "GO" button to execute the next cue
- **Usage**: Click the GO button or your configured hotkey to advance the cue stack
- **When enabled**: Appears at the top of the control section

#### 📊 Cue Status
- **Default**: ☐ Disabled
- **Purpose**: Shows your current position in the cue stack (e.g., "Ready: Cue 3 of 12")
- **Usage**: Helpful for staying synchronized during a show
- **When enabled**: Appears below the GO button

#### ⚡ Quick Cues
- **Default**: ☐ Disabled
- **Purpose**: Reserved for future feature expansion
- **Usage**: Will allow quick access to frequently-used cues
- **When enabled**: Ready for future updates

### Saving Your Preferences

- Your choices are saved **automatically** when you check/uncheck
- Click **"Done"** to close the menu
- Your preferences are **remembered** the next time you open the deck

### Using the Cue Go Button

1. Ensure "Cue Go Button" is enabled in the customize menu
2. The large **GO** button appears at the top
3. Click the button to advance to the next cue
4. The status updates automatically
5. When you reach the last cue, the button becomes disabled

## For Developers

### Extending with New Widgets

The system is designed for easy expansion. To add a new widget:

#### 1. Add HTML Checkbox
```html
<!-- In the deck modal, around line 340 -->
<label class="deck-checkbox-item">
  <input type="checkbox" id="showMyFeature" checked>
  <div class="deck-checkbox-label">
    <span class="deck-checkbox-label-title">My Feature</span>
    <span class="deck-checkbox-label-desc">Description here</span>
  </div>
</label>
```

#### 2. Add Setting
```javascript
// In the deckSettings object, line ~10
const deckSettings = {
  showGoButton: true,
  showCueStatus: false,
  showQuickCues: false,
  showMyFeature: false  // NEW
};
```

#### 3. Add Event Handler
```javascript
// In initializeModal() function, around line ~80
document.getElementById('showMyFeature').addEventListener('change', (e) => {
  deckSettings.showMyFeature = e.target.checked;
  saveDeckSettings();
  applyDeckSettings();
});
```

#### 4. Add to applyDeckSettings()
```javascript
// In applyDeckSettings() function, around line ~35
document.getElementById('showMyFeature').checked = deckSettings.showMyFeature;
```

#### 5. Render the Widget
```javascript
// In renderControls() function, around line ~220
if (deckSettings.showMyFeature) {
  const myFeatureEl = document.createElement('div');
  myFeatureEl.className = 'deck-my-feature';
  myFeatureEl.textContent = 'My Feature Content';
  controlsSection.appendChild(myFeatureEl);
}
```

#### 6. Add CSS (Optional)
```css
/* In the <style> section, around line ~200 */
.deck-my-feature {
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  color: var(--text);
}
```

### API Endpoints

#### GET /api/cuestack
Retrieves the current cue stack state.

**Response:**
```json
{
  "name": "My Show",
  "cues": [
    {
      "custom": {
        "label": "Standby",
        "color": "#6b7280",
        "actions": []
      }
    },
    {
      "custom": {
        "label": "Scene 1",
        "color": "#ff0000",
        "actions": [
          {"type": "trigger", "layer": 1, "column": 1}
        ]
      }
    }
  ],
  "currentIndex": -1
}
```

#### POST /api/cuestack/execute
Executes the next cue in the stack.

**Request:**
```json
{}
```

**Response:**
```json
{
  "name": "My Show",
  "cues": [...],
  "currentIndex": 0,
  "message": "Cue #0 executed"
}
```

### Testing the Feature

```bash
# From the project root:
npm run dev

# In another terminal, test the API:
curl http://localhost:3200/api/cuestack

# Execute next cue:
curl -X POST http://localhost:3200/api/cuestack/execute \
  -H "Content-Type: application/json"
```

### LocalStorage Structure

```javascript
// Browser DevTools Console:
JSON.parse(localStorage.getItem('showcall_deck_settings'))

// Output:
{
  "showGoButton": true,
  "showCueStatus": false,
  "showQuickCues": false
}
```

### File Locations

- **Frontend**: `public/deck.html` (730 lines)
- **Backend**: `server.mjs` (lines 479-556 for cue stack endpoints)
- **Persistent Storage**: `~/Library/Application Support/ShowCall/cuestack.json`
- **Browser Storage**: `localStorage.showcall_deck_settings`

## Troubleshooting

### GO Button Doesn't Appear
- Make sure "Cue Go Button" is checked in the customize menu
- Refresh the page if it's still not showing
- Check browser console for errors (F12 → Console tab)

### Cue Not Executing
- Verify Resolume is running and connected
- Check that the cue has actions defined
- Look at browser console for error messages
- Check server.mjs logs in terminal

### Settings Not Saving
- Check if localStorage is enabled (usually is by default)
- Try clearing localStorage and refreshing
- Look for "Uncaught Error" in console
- Try a different browser

### Deck Window Won't Open
- Make sure main ShowCall app is running
- Check that port 3200 is available
- Look at Electron console (⌘+Option+I) for errors

## Performance Tips

- Don't enable all widgets if you don't need them
- The GO button is optimized for <200ms response time
- Cue list will be heavy if you have 100+ cues (optimize rendering in future)
- Status updates are instant (no network delay)

## Future Roadmap

Planned enhancements:
- ⭐ Quick keyboard shortcut for GO button (Space or Enter)
- ⭐ Full cue list with preview
- ⭐ Cue search/filter
- ⭐ Custom hotkeys for each cue
- ⭐ Cue notes/descriptions
- ⭐ Cue timing/duration display
- ⭐ Multi-deck support (sync between windows)
- ⭐ Cue import/export

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review `PRESET_DECK_CUSTOMIZATION.md` for full documentation
3. Check `DECK_ARCHITECTURE.md` for technical details
4. Open an issue on GitHub

## Feedback

We'd love to hear how you use the deck customization! Consider:
- Which widgets do you find most useful?
- What widgets would you like to see next?
- Are the default settings good for you?
- Any performance issues?

Share your thoughts by opening a GitHub issue or discussion!
