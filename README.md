# ShowCall - Resolume Arena Controller

> Professional remote controller for Resolume Arena using OSC + REST API

![ShowCall Interface](https://img.shields.io/badge/version-2.3.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A professional Electron-based controller for Resolume Arena using **OSC for control** and **REST API for monitoring** - the complete way to control Resolume from any computer on your network.

## ✨ What's New in v2.3.2

### 🔄 **Real-Time Updates & Visual Feedback** - Critical Bug Fixes!

**Fixed Issues:**
- ✅ **Instant Preset Updates** - Presets now update on Stream Deck immediately when saved (no restart needed)
- ✅ **Visual Button Feedback** - Buttons flash bright orange when pressed for clear execution confirmation

**Previous: Stream Deck Integration** - Revolutionary Feature!

Create presets in ShowCall → They instantly appear on your Stream Deck! No manual configuration needed.

**Key Benefits:**
- ⚡ **90% faster setup** - Zero manual button configuration
- 🎨 **100% accurate** - Colors and labels always match
- 🔄 **Real-time sync** - Changes update in <100ms
- 🎯 **One-click execution** - Press Stream Deck to run complete macros
- ✨ **Visual feedback** - Buttons flash orange when pressed (NEW in v2.3.2!)

[📖 **Read the Complete Guide →**](docs/PRESET_SYNC_GUIDE.md) | [🚀 **Quick Reference →**](docs/QUICK_REFERENCE.md)

---

## 🎯 Core Features

### Control & Monitoring
- **⚡ OSC Control** - Lightning-fast clip triggering (<1ms latency) via official Resolume protocol
- **📊 Real-time Monitoring** - Live display of program/preview clips, BPM, composition status  
- **🔌 Auto-Discovery** - Automatically reads your Resolume composition structure
- **🎯 Clip Grid** - Visual grid showing all layers and columns with current states
- **💻 Cross-Platform** - Works on macOS, Windows, and Linux

### Presets & Macros
- **🎹 Preset System** - Create complex multi-step macros with visual editor
- **⌨️ Keyboard Shortcuts** - Fast hotkey control for all actions
- **🎛️ Stream Deck Sync** - Automatic synchronization with Bitfocus Companion (NEW in v2.3.2!)
- **🎨 Custom Styling** - Configure colors, labels, and hotkeys
- **📦 Preset Management** - Import, export, and organize presets

### Enhanced Features
- **🔄 Auto-Updater** - In-app update notifications with progress tracking
- **⚙️ Settings UI** - Configure Resolume connection via friendly modal
- **🪟 Pop-out Deck** - Separate window for preset buttons
- **🎬 Quick Actions** - Cut, Clear, and transport controls
- **📡 WebSocket API** - Real-time communication for integrations

---

## 🚀 Quick Start

### 1. Download & Install

**Latest Release:** [v2.3.2](https://github.com/trevormarrr/showcall/releases/tag/v2.3.2)

- **macOS**: Download `.dmg` → Drag to Applications
- **Windows**: Download `.exe` → Run installer
- **Linux**: Download `.AppImage` → Make executable and run

### 2. Setup Resolume

1. **Enable OSC Input** (for control):
   - Resolume → Preferences → OSC
   - ✅ Enable OSC Input
   - Port: `7000` (default)

2. **Enable Web Server** (for monitoring):
   - Preferences → Web Server
   - ✅ Enable Web Server
   - Port: `8080` (default)

3. **Note your IP address** shown in Resolume preferences

### 3. Configure ShowCall

1. Launch ShowCall
2. Click **⚙️ Settings**
3. Enter your Resolume IP address and ports
4. Click **Save & Restart**
5. ShowCall will connect automatically!

### 4. Start Creating

- **Click cells** in the grid to trigger clips
- **Click column headers** to trigger entire columns
- **Create presets** via the **🎛️ Presets** button
- **Use quick actions** for Cut, Clear, etc.

---

## 🎛️ Stream Deck Integration (NEW!)

### Setup in 5 Minutes

1. **Build Companion Module:**
   ```bash
   cd showcall-companion
   npm install && npm run build
   ```

2. **Install in Companion:**
   - Open Bitfocus Companion
   - Install the generated `.tgz` file

3. **Connect Companion:**
   - Add ShowCall connection
   - Host: `localhost` (or ShowCall server IP)
   - Port: `3200`

4. **Create Presets:**
   - Open ShowCall → Click **🎛️ Presets**
   - Create your presets
   - They appear on Stream Deck automatically! ✨

**Complete Guide:** [PRESET_SYNC_GUIDE.md](PRESET_SYNC_GUIDE.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[RELEASE_NOTES.md](RELEASE_NOTES.md)** | v2.3.2 release notes |
| **[CHANGELOG.md](CHANGELOG.md)** | Complete version history |
| **[INSTALLATION.md](docs/INSTALLATION.md)** | Detailed installation guide |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute |

---

## 💻 Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Resolume Arena 7.19+

### Setup

```bash
# Clone the repository
git clone https://github.com/trevormarrr/showcall.git
cd showcall

# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run dist
```

### Project Structure

```
showcall/
├── electron/          # Electron main process
├── public/            # Frontend (HTML/CSS/JS)
├── server.mjs         # Backend server (Express + OSC)
├── prisma/            # (Not used in this project)
└── docs/              # Documentation
```

---

## 🔧 Configuration

### Environment Variables

ShowCall stores configuration in:
- **macOS**: `~/Library/Application Support/ShowCall/.env`
- **Windows**: `%APPDATA%\ShowCall\.env`
- **Linux**: `~/.showcall/.env`

```env
# Resolume connection
RESOLUME_HOST=10.1.110.72
RESOLUME_REST_PORT=8080
RESOLUME_OSC_PORT=7000

# Server settings
PORT=3200
NODE_ENV=production
MOCK=0
```

### Presets Storage

Presets are stored in:
- **macOS**: `~/Library/Application Support/ShowCall/presets.json`
- **Windows**: `%APPDATA%\ShowCall\presets.json`
- **Linux**: `~/.showcall/presets.json`

---

## 🎨 Example Preset

```json
{
  "id": "worship_intro",
  "label": "Worship Intro",
  "color": "#e11d48",
  "hotkey": "w",
  "macro": [
    {"type": "clear"},
    {"type": "sleep", "ms": 200},
    {"type": "trigger", "layer": 1, "column": 3},
    {"type": "trigger", "layer": 2, "column": 3},
    {"type": "cut"}
  ]
}
```

This preset clears all layers, waits 200ms, triggers clips on layer 1 and 2 column 3, then cuts to program.

---

## 🆘 Troubleshooting

### Connection Issues

**ShowCall can't connect to Resolume:**
1. Verify Resolume is running
2. Check Web Server is enabled (port 8080)
3. Check OSC Input is enabled (port 7000)
4. Verify IP address is correct
5. Check firewall settings

**Stream Deck presets not syncing:**
1. Verify Companion is connected to ShowCall
2. Check port 3200 is accessible
3. Review Companion logs for errors
4. Try reconnecting Companion

### Common Issues

- **"Connection failed"** - Check Resolume IP and ports in Settings
- **"Clip grid not loading"** - Ensure Resolume Web Server is enabled
- **"Presets not executing"** - Verify OSC is enabled in Resolume
- **"Update button missing"** - This was fixed in v2.2.1+

**More Help:** [PRESET_SYNC_GUIDE.md - Troubleshooting](PRESET_SYNC_GUIDE.md#troubleshooting)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs via [GitHub Issues](https://github.com/trevormarrr/showcall/issues)
- 💡 Suggest features via [GitHub Discussions](https://github.com/trevormarrr/showcall/discussions)
- 📝 Improve documentation
- 🔧 Submit pull requests

---

## 📋 Requirements

- **Resolume Arena:** 7.19 or later
- **Node.js:** 16 or later (for development)
- **OS:** macOS 10.13+, Windows 10+, or Linux
- **Network:** Same network as Resolume computer
- **Optional:** Bitfocus Companion 3.0+ for Stream Deck integration

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Resolume** - For excellent OSC and REST API
- **Bitfocus Companion** - For Stream Deck integration platform
- **Electron** - For cross-platform desktop framework
- **All contributors** - Thank you for your support!

---

## 📞 Support

- **Documentation:** See docs above
- **Issues:** [GitHub Issues](https://github.com/trevormarrr/showcall/issues)
- **Discussions:** [GitHub Discussions](https://github.com/trevormarrr/showcall/discussions)
- **Email:** trevormarrr@users.noreply.github.com

---

## 🗺️ Roadmap

### v2.4.0 (Planned)
- Preset thumbnails/icons
- Execution history tracking
- Enhanced feedback to Stream Deck
- Preset categories and favorites

### v3.0.0 (Future)
- Web-based control interface
- Mobile app (iOS/Android)
- Multi-user collaboration
- Cloud preset sync

See [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) for complete roadmap.

---

## ⭐ Star History

If you find ShowCall useful, please consider starring the project on GitHub!

---

**Version:** 2.3.2  
**Release Date:** February 14, 2026  
**License:** MIT

**Download Now:** [GitHub Releases](https://github.com/trevormarrr/showcall/releases/tag/v2.3.2)

**Happy streaming! 🎬✨**
