# ShowCall - Resolume Arena Controller



> Professional remote controller for Resolume Arena using OSC + REST APIA professional Electron-based controller for Resolume Arena using **OSC for control** and **REST API for monitoring** - the real way to control Resolume.



A desktop application that lets you control Resolume Arena from any computer on your network. Built with Electron, Node.js, and the official Resolume OSC protocol.## Features



![ShowCall Interface](https://img.shields.io/badge/version-1.0.0-blue)### ✨ Core Functionality

![License](https://img.shields.io/badge/license-MIT-green)- **OSC Control**: Lightning-fast clip triggering via OSC (UDP) - the official Resolume control protocol

- **REST Monitoring**: Real-time display of program/preview clips, BPM, and composition status

## ✨ Features- **Clip Grid Interface**: Visual grid showing all layers and columns with current states

- **Preset Macros**: Customizable preset buttons with multi-step macro support

- **🎯 Clip Grid** - Visual grid auto-populated from your Resolume composition- **Keyboard Shortcuts**: Fast hotkey control for all preset actions

- **⚡ Fast Control** - OSC protocol for instant clip triggering (<1ms latency)- **Hybrid Architecture**: OSC for control (fast) + REST for monitoring (reliable)

- **📊 Real-time Monitoring** - Live display of program/preview clips, BPM, and status

- **🎹 Preset Macros** - Customizable buttons with hotkey support### 🎛️ Interface Elements

- **🔌 Auto-Discovery** - Automatically reads your composition structure- **Program/Preview Display**: Shows currently active and cued clips

- **💻 Cross-Platform** - Works on macOS, Windows, and Linux- **Interactive Grid**: Click cells to trigger clips, click columns to trigger entire columns

- **Quick Actions**: Cut, Clear, and other transport controls

## 🚀 Quick Start- **Preset Deck**: Customizable buttons with visual feedback and hotkeys

- **Connection Status**: Real-time indicator of Resolume connection health

### Download & Install

### 🚀 Enhanced Features (v2.0)

1. **Download the latest release** from [Releases](https://github.com/trevormarrr/showcall/releases)- **Improved Error Handling**: Comprehensive error reporting and recovery

   - macOS: Download `.dmg` file- **Better API Integration**: Full compatibility with Resolume Arena 7.19 API

   - Windows: Download `.exe` installer- **Visual Feedback**: Notifications, loading states, and button press animations

   - Linux: Download `.AppImage`- **Responsive Design**: Works on different screen sizes

- **Enhanced Logging**: Detailed console output for debugging

2. **Install the application**

   - macOS: Open DMG and drag to Applications## Installation & Setup

   - Windows: Run installer

   - Linux: Make executable and run### Prerequisites

- Resolume Arena 7.19 or later

### Setup Resolume- Node.js 16+ 

- Network access to Resolume computer

1. **Enable OSC Input** (for control):

   - Open Resolume Arena → Preferences → OSC### Installation

   - ✅ Enable OSC Input```bash

   - Set Input Port: `7000`# Clone or download the project

cd showcall

2. **Enable Web Server** (for monitoring):

   - Preferences → Web Server# Install dependencies

   - ✅ Enable Web Servernpm install

   - Port: `8080`

# Configure your Resolume connection (edit .env file)

3. **Note your IP address** shown in Resolume preferences# Set RESOLUME_HOST to your Resolume computer's IP address



### Configure ShowCall# Start in development mode

npm run dev

1. **First Launch**: ShowCall will create a `.env` file

2. **Edit the connection settings**:# Or build for production

   ```bashnpm run dist

   RESOLUME_HOST=10.1.110.72    # Change to your Resolume computer's IP```

   RESOLUME_REST_PORT=8080       # REST API port (monitoring)

   RESOLUME_OSC_PORT=7000        # OSC port (control)### Resolume Setup

   PORT=3200                     # ShowCall server port

   ```**Enable Web Server (for monitoring):**

1. Open Resolume Arena Preferences

3. **Restart ShowCall** - You should see:2. Navigate to "Web Server" tab

   - ✅ Green connection indicator3. ✅ Enable Web Server (Port 8080)

   - Your composition name displayed

   - Grid auto-populated with your clips**Enable OSC Input (for control):**

1. Open Resolume Arena Preferences  

## 🎛️ Usage2. Navigate to "OSC" tab

3. ✅ Enable OSC Input

### Clip Grid4. Set OSC Input Port to 7000

- **Click any cell** to trigger that clip5. Note the IP address shown

- **Click column header** to trigger all clips in that column

- **Empty cells** show blank (no clip assigned)Update your `.env` file with the correct IP address

- **5×8 grid default** - Click "Show More" to expand

## Configuration

### Quick Actions

- **Clear All** - Disconnect all clips### Environment Variables (.env)

- **Cut (Prev→Prog)** - Cut preview to program```bash

- **Test Buttons** - Verify individual triggersPORT=3200                              # ShowCall server port

MOCK=0                                 # Set to 1 for mock mode (testing)

### Preset MacrosRESOLUME_HOST=10.1.110.72             # Resolume computer IP

- Configure in `public/config.json`RESOLUME_REST_PORT=8080               # REST API port (monitoring)

- Multi-step sequences with delaysRESOLUME_OSC_PORT=7000                # OSC port (control)

- Keyboard shortcuts support```

- Visual feedback with color coding

### Content Configuration (public/config.json)

### Keyboard Shortcuts```json

- Configure hotkeys in preset definitions{

- Default examples: `1`, `2`, `3`, `B` for presets  "compositionName": "Your_Composition",

- Works when app is focused  "layers": [

    { "id": 1, "name": "Layer 1" },

## 🔧 Configuration    { "id": 2, "name": "Layer 2" }

  ],

### Environment Variables (`.env`)  "columns": [

```bash    { "id": 1, "name": "Column 1" },

PORT=3200                    # ShowCall server port    { "id": 2, "name": "Column 2" }

RESOLUME_HOST=10.1.110.72   # Resolume computer IP address  ],

RESOLUME_REST_PORT=8080     # REST API port (monitoring)  "cells": [

RESOLUME_OSC_PORT=7000      # OSC port (control)    { "layer": 1, "column": 1, "label": "Your Clip Name" }

MOCK=0                      # Set to 1 for testing mode  ],

```  "presets": [

    {

### Preset Macros (`public/config.json`)      "id": "preset1",

```json      "label": "Walk-In",

{      "color": "#0ea5e9",

  "presets": [      "hotkey": "1",

    {      "macro": [

      "id": "walk-in",        { "type": "trigger", "layer": 1, "column": 1 },

      "label": "Walk-In Scene",        { "type": "cut" }

      "color": "#0ea5e9",      ]

      "hotkey": "1",    }

      "macro": [  ]

        { "type": "trigger", "layer": 1, "column": 1 },}

        { "type": "sleep", "ms": 500 },```

        { "type": "cut" }

      ]## API Endpoints

    }

  ]### Status Monitoring

}- `GET /api/status` - Server-Sent Events stream for real-time status

```- `GET /api/connection` - Check Resolume connection status

- `GET /health` - Application health check

### Macro Actions

- `trigger` - Trigger specific clip: `{"type": "trigger", "layer": 1, "column": 2}`### Clip Control

- `triggercolumn` - Trigger entire column: `{"type": "triggercolumn", "column": 1}`- `POST /api/trigger` - Trigger specific clip

- `cut` - Cut to program: `{"type": "cut"}`  ```json

- `clear` - Clear all clips: `{"type": "clear"}`  { "layer": 1, "column": 2 }

- `sleep` - Wait milliseconds: `{"type": "sleep", "ms": 500}`  ```

- `POST /api/triggerColumn` - Trigger entire column

## 🏗️ Development  ```json

  { "column": 2, "layers": [{"layer": 1}, {"layer": 2}] }

### Prerequisites  ```

- Node.js 16+

- npm or yarn### Transport Control

- `POST /api/cut` - Cut to program (resync)

### Setup- `POST /api/clear` - Clear all clips

```bash

# Clone repository### Macro Execution

git clone https://github.com/trevormarrr/showcall.git- `POST /api/macro` - Execute custom macro

cd showcall  ```json

  {

# Install dependencies    "macro": [

npm install      { "type": "trigger", "layer": 1, "column": 1 },

      { "type": "sleep", "ms": 500 },

# Copy example environment file      { "type": "cut" }

cp .env.example .env    ]

  }

# Edit .env with your Resolume IP  ```

nano .env

## Macro System

# Run in development mode

npm run dev### Supported Actions

```- `trigger` - Trigger specific clip

- `triggercolumn` - Trigger entire column

### Build- `cut` - Cut to program

```bash- `clear` - Clear all clips

# Build for current platform- `sleep` - Wait specified milliseconds

npm run dist

### Example Macro

# Package without building installer (faster)```json

npm run pack{

```  "type": "trigger",

  "layer": 1,

## 🛠️ Troubleshooting  "column": 2,

  "critical": false

### Connection Issues}

- ✅ Check Resolume OSC Input is enabled (port 7000)```

- ✅ Check Resolume Web Server is enabled (port 8080)

- ✅ Verify IP address in `.env` is correct## Keyboard Shortcuts

- ✅ Ensure both computers are on same network

- ✅ Check firewall isn't blocking portsAll preset hotkeys are configurable. Default examples:

- `1`, `2`, `3` - Trigger presets

### Grid Not Populating- `b` - Bumper/transition preset

- Open Resolume and load a composition- `c` - Clear action

- Click "Refresh Grid" button in ShowCall- `Space` - Cut action (if configured)

- Check connection status indicator (top right)

- Verify composition has clips with names## Troubleshooting



### Triggers Not Working### Connection Issues

- Verify green "OSC" indicator in top right1. Verify Resolume web server is enabled

- Test with "Test L1C1" button2. Check IP address in `.env` file

- Check Resolume OSC preferences3. Ensure no firewall blocking port 8080

- Try triggering clips manually in Resolume first4. Test connection at `http://RESOLUME_IP:8080`



### Mock Mode (Testing Without Resolume)### Mock Mode

```bashFor testing without Resolume:

# Set in .env file```bash

MOCK=1MOCK=1 npm run dev

``````

Simulates Resolume responses for testing the UI

### Debug Mode

## 📡 Technical DetailsEnable detailed logging:

```bash

### ArchitectureDEBUG=1 npm run dev

- **OSC (UDP)** - All control commands sent via OSC protocol```

  - Clips: `/composition/layers/{layer}/clips/{column}/connect`

  - Columns: `/composition/columns/{column}/connect`## Development

  - Clear: `/composition/disconnectall`

  - Cut: `/composition/tempocontroller/resync`### File Structure

```

- **REST API (HTTP)** - Read-only monitoringshowcall/

  - Composition structure: `GET /api/v1/composition`├── server.js           # Main Express server

  - Real-time status via Server-Sent Events├── electron/main.cjs   # Electron main process

├── public/

- **Hybrid Benefits**│   ├── index.html      # Frontend HTML

  - OSC: Fast, fire-and-forget control (~1ms latency)│   ├── app.js          # Frontend JavaScript

  - REST: Reliable monitoring and composition discovery│   ├── styles.css      # Styling

  - Best of both protocols│   └── config.json     # Content configuration

├── package.json        # Dependencies & scripts

### API Endpoints└── .env               # Environment configuration

```

ShowCall exposes these local endpoints:

### Building

- `GET /api/composition` - Get full composition structure```bash

- `GET /api/status` - Server-Sent Events stream# Development

- `GET /api/connection` - Connection health checknpm run dev

- `POST /api/trigger` - Trigger clip `{"layer": 1, "column": 2}`

- `POST /api/triggerColumn` - Trigger column `{"column": 1}`# Package for current OS

- `POST /api/cut` - Cut to programnpm run pack

- `POST /api/clear` - Clear all clips

- `POST /api/macro` - Execute macro sequence# Build distributable

npm run dist

## 📄 License```



MIT License - see [LICENSE](LICENSE) file## Technical Notes



## 🤝 Contributing### Resolume Control Architecture

- **OSC (UDP:7000)** - All control commands (trigger, clear, cut)

Contributions welcome! Please feel free to submit a Pull Request.- **REST API (HTTP:8080)** - Status monitoring only

- **1-based indexing** - OSC uses Layer 1, Column 1 (matches UI)

## 💬 Support- **Near-instant response** - UDP fire-and-forget, no HTTP latency



- **Issues**: [GitHub Issues](https://github.com/trevormarrr/showcall/issues)### Performance

- **Discussions**: [GitHub Discussions](https://github.com/trevormarrr/showcall/discussions)- 1-second status updates

- Efficient SSE streaming

## 🙏 Acknowledgments- Automatic reconnection

- Optimized UI updates

- Built with official [Resolume OSC Protocol](https://resolume.com/manual/en/r7/control)

- Uses [Resolume REST API](https://resolume.com/docs/restapi/) for monitoring## License

- Powered by [Electron](https://www.electronjs.org/)

MIT License - see LICENSE file for details.

---

## Support

**Made with ❤️ for the live production community**

For issues and questions:
1. Check Resolume web server settings
2. Verify network connectivity
3. Check console for error messages
4. Test in mock mode first