# ShowCall v2.4.0 Release Notes

## 🎭 Major Feature: Cue Stack System

Professional theatrical-style cue stack for running shows cue by cue. This release brings sequential show control to ShowCall, perfect for worship services, concerts, theatre productions, and any live event requiring precise sequential execution.

### What is a Cue Stack?

A cue stack is a sequential list of cues that you can advance through during a show. Press GO to execute the next cue, just like professional lighting consoles used in theatres and concerts.

### Key Features

#### 🎯 Professional Workflow
- **Theatrical Numbering**: Starts with Cue 0 (Standby), then Cue 1, 2, 3...
- **Auto Standby**: Every show automatically includes Cue 0 as a pre-show starting position
- **Sequential Execution**: Press GO to advance through your show step-by-step
- **Visual Feedback**: Clear indicators show current cue, next cue, and completed cues

#### 🎨 Visual State System
- **🟦 Cyan Glow**: Currently active/running cue
- **🟨 Yellow Tint**: Next cue ready to execute
- **⚫ Faded/Strikethrough**: Completed cues with checkmark

#### ⌨️ Keyboard Control
- \`Space\` - GO (advance to next cue)
- \`R\` - Reset to standby position
- \`1-9\` - Fire cues 0-8 directly
- \`0\` - Fire cue 9 directly

#### 🎬 Flexible Cue Types

**Preset Cues**
- Add any existing preset to your cue stack
- Full macro execution with all preset actions
- Maintains all preset settings and timing

**Custom Cues**
- Build cues with visual action editor
- Available actions: trigger, triggerColumn, cut, clear, sleep
- Custom labels and colors for easy identification
- No JSON required - visual builder like presets

#### 🎛️ Management Features
- **Named Shows**: Give each cue stack a descriptive name
- **Drag & Drop**: Easily reorder cues in the management modal
- **Progress Tracking**: Visual progress bar and status text
- **Jump to Cue**: Skip to any cue position
- **Execute Specific Cue**: Fire any cue directly without affecting stack position
- **Persistent Storage**: Shows automatically save and load
- **Missing Preset Detection**: Clear warnings for broken preset references

### Typical Workflow

1. **Build Your Show**
   - Click "Manage" in the Cue Stack section
   - Add presets from your preset library
   - Add custom cues for special actions
   - Drag to reorder as needed
   - Name your show

2. **Run Your Show**
   - Stack starts at standby (before Cue 0)
   - Press GO or Space to advance through each cue
   - Visual indicators show current position
   - Progress bar tracks completion

3. **Control Options**
   - Sequential: Press GO to advance cue by cue
   - Direct Access: Press number keys to fire specific cues
   - Jump: Use jump buttons to skip to any position
   - Reset: Press R to return to standby

### Use Cases

#### Worship Services
\`\`\`
Cue 0: Standby (house lights up)
Cue 1: Walk-In (background loop + NDI feed)
Cue 2: Worship Set 1 (song backgrounds)
Cue 3: Announcements (camera 1)
Cue 4: Worship Set 2
Cue 5: Sermon (sermon background)
Cue 6: Closing
\`\`\`

#### Theatre Productions
\`\`\`
Cue 0: House to Half
Cue 1: Preset (stage lights set)
Cue 2: Act 1 Scene 1
Cue 3: Scene Change
Cue 4: Act 1 Scene 2
...
\`\`\`

#### Concert Tours
\`\`\`
Cue 0: Walk-In Music
Cue 1: Intro Video
Cue 2: Song 1 Opening
Cue 3: Song 1 Chorus
Cue 4: Song 1 Bridge
...
\`\`\`

### Technical Details

- **0-based Index System**: Uses theatrical convention with currentIndex = -1 for standby
- **Backward Compatible**: Handles old saved cue stacks gracefully
- **LocalStorage Persistence**: Shows survive browser refreshes
- **Smart Preset Lookup**: Validates preset references on load
- **Enhanced Logging**: Detailed console logs for debugging

## 🐛 Bug Fixes

- Fixed visual state synchronization in cue stack display
- Improved preset ID validation and error handling
- Fixed currentIndex tracking for proper active cue highlighting
- Removed redundant UI labels from custom cue display

## 🔧 Technical Improvements

- Implemented theatrical cue index system
- Enhanced localStorage persistence
- Improved error detection for missing presets
- Better console logging for execution flow

## 📦 Installation

### macOS
Download \`ShowCall-2.4.0-arm64.dmg\` for Apple Silicon or \`ShowCall-2.4.0.dmg\` for Intel Macs.

### Auto-Update
If you're on v2.3.4 or later, the app will automatically notify you of this update.

## 🔗 Links

- [Full Changelog](https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md)
- [Documentation](https://github.com/trevormarrr/showcall#readme)
- [Report Issues](https://github.com/trevormarrr/showcall/issues)

## ⬆️ Upgrading

All features from previous versions are included. Your existing presets, settings, and compositions will work seamlessly with the new cue stack system.

---

**What's Next?** Check out the [Roadmap](https://github.com/trevormarrr/showcall/blob/main/docs/ROADMAP.md) to see what's coming in future releases!
