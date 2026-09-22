# ShowCall

**Current release: [v2.6.3](https://github.com/trevormarrr/showcall/releases/tag/v2.6.3)**

A desktop controller for Resolume Arena, built for worship services, concerts, theatre, and live events. ShowCall combines clip control, visual presets, and sequential cue stacks in one interface, using OSC to send commands and the Resolume REST API to monitor your composition.

[Download](https://github.com/trevormarrr/showcall/releases/latest) · [Documentation](#documentation) · [Report an issue](https://github.com/trevormarrr/showcall/issues)

## Features

- **Live composition grid:** View layers, columns, and program/preview states. Trigger individual clips or entire columns.
- **Visual preset editor:** Build multi-step macros with clips, columns, delays, and effects. Assign labels, colors, and hotkeys, and import or export presets.
- **Cue stacks:** Build sequential shows from presets and custom cues. Edit and reorder cues, track active and upcoming cues, and start from Cue 0 (Standby).
- **Quick actions:** Access Cut, Clear, and transport controls.
- **Pop-out deck:** Open preset buttons in a separate window.
- **Stream Deck integration:** Synchronize presets with Bitfocus Companion for hardware control.
- **Connection settings:** Configure the Resolume host and ports from the app.
- **Update notifications:** Check for new releases through the built-in updater.

## Requirements

- Resolume Arena 7.19 or later.
- A macOS, Windows, or Linux computer compatible with the release you download.
- Network access to the Resolume computer, with OSC Input and the Web Server enabled.
- Optional: Bitfocus Companion 3.0 or later and a Stream Deck for hardware control.

Node.js and npm are only needed when running or building ShowCall from source.

## Installation

Download the appropriate installer from [GitHub Releases](https://github.com/trevormarrr/showcall/releases/latest).

| Platform | Installation |
| --- | --- |
| macOS | Open the `.dmg` and drag ShowCall into Applications. |
| Windows | Run the `.exe` installer. |
| Linux | Make the `.AppImage` executable, then launch it. |

For detailed setup instructions, see the [Installation Guide](docs/INSTALLATION.md).

## Quick start

### 1. Configure Resolume

1. Open Resolume Arena and load your composition.
2. In **Preferences → OSC**, enable **OSC Input** and note its port.
3. In **Preferences → Web Server**, enable the web server and note its port.
4. Note the Resolume computer's IP address.

### 2. Connect ShowCall

1. Launch ShowCall and open **Settings**.
2. Enter the Resolume computer's IP address. Use `127.0.0.1` if both apps run on the same computer.
3. Enter the REST and OSC ports configured in Resolume.
4. Select **Save & Restart**.
5. Confirm that your composition appears in the grid.

| Connection | Default port | Purpose |
| --- | --- | --- |
| Resolume OSC Input | `7000` / UDP | Send control commands to Resolume. |
| Resolume Web Server | `8080` / HTTP | Read composition and playback status. |
| ShowCall server | `3200` | Connect integrations such as Companion. |

### 3. Build and run your show

Click a grid cell to trigger a clip or a column header to trigger a column. Open **Presets** to create reusable macros, then combine presets and custom cues into a cue stack.

| Cue stack shortcut | Action |
| --- | --- |
| `Space` | GO — advance the cue stack. |
| `R` | Reset the cue stack. |

See the [Quick Reference](docs/QUICK_REFERENCE.md) for controls and the [Visual Editor Guide](docs/VISUAL_EDITOR_GUIDE.md) for macro creation.

## Stream Deck and Companion

ShowCall integrates with Bitfocus Companion to synchronize preset labels and colors and execute macros from a Stream Deck.

1. Install the ShowCall Companion module using the [Preset Sync Guide](docs/PRESET_SYNC_GUIDE.md).
2. Add a ShowCall connection in Companion.
3. Set the host to the ShowCall computer's IP address, or `localhost` when Companion runs on the same computer.
4. Set the port to `3200`, unless you have changed the ShowCall server port.
5. Create or update presets in ShowCall and confirm they synchronize with Companion.

## Configuration and data

Use **Settings** for normal connection changes. ShowCall stores connection settings in `.env` and presets in `presets.json`.

| Platform | Configuration and preset directory |
| --- | --- |
| macOS | `~/Library/Application Support/ShowCall/` |
| Windows | `%APPDATA%\ShowCall\` |
| Linux | `~/.showcall/` |

Example configuration for Resolume running on the same computer:

```dotenv
RESOLUME_HOST=127.0.0.1
RESOLUME_REST_PORT=8080
RESOLUME_OSC_PORT=7000
PORT=3200
NODE_ENV=production
MOCK=0
```

Replace `RESOLUME_HOST` with the Resolume computer's IP address for a network connection. Back up your configuration and export presets before moving to another computer.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| ShowCall cannot connect or the grid is empty | Confirm Resolume is running with a composition loaded. Check the host address, Web Server setting, REST port, and network access. |
| The grid updates, but clips or presets do not trigger | Confirm OSC Input is enabled and the OSC port matches ShowCall. Check that UDP traffic is allowed between the computers. |
| Commands work, but status does not update | Check the Resolume Web Server and REST port. Control and monitoring use separate connections. |
| Companion cannot connect | Confirm ShowCall is running and Companion uses the ShowCall host and server port, rather than the Resolume ports. |
| Presets do not appear in Companion | Check the ShowCall connection in Companion and follow the Preset Sync Guide. |
| An in-app update fails | Download and install the release manually from GitHub Releases. |

If the issue persists, [open a GitHub issue](https://github.com/trevormarrr/showcall/issues) with your ShowCall version, Resolume version, operating system, steps to reproduce, and relevant logs or screenshots.

## Development

### Run from source

Install Node.js and npm compatible with the project's dependencies, then clone the repository:

```bash
git clone https://github.com/trevormarrr/showcall.git
cd showcall
npm install
npm run dev
```

### Build installers

```bash
npm run dist
```

See [Code Signing](docs/CODE_SIGNING.md) for signing and notarization details.

### Architecture

ShowCall uses Electron for the desktop application, an Express/Node.js backend, and an HTML/CSS/JavaScript interface. The Electron main process starts `server.mjs`. The backend sends OSC commands to Resolume, polls its REST API, and streams status updates to the interface through Server-Sent Events (SSE). A WebSocket API supports integrations.

| Path | Purpose |
| --- | --- |
| `electron/` | Electron main process and window management. |
| `public/` | Frontend interface, styles, and client logic. |
| `server.mjs` | Express backend, OSC control, and monitoring. |
| `build/` | Application icons and build resources. |
| `docs/` | Setup, usage, and development documentation. |

## Documentation

| Guide | Contents |
| --- | --- |
| [Quick Reference](docs/QUICK_REFERENCE.md) | Features and controls. |
| [Installation](docs/INSTALLATION.md) | Installation and connection setup. |
| [Quickstart Tutorial](docs/QUICKSTART.md) | Initial setup walkthrough. |
| [Visual Editor](docs/VISUAL_EDITOR_GUIDE.md) | Preset and macro creation. |
| [Preset Sync](docs/PRESET_SYNC_GUIDE.md) | Companion and Stream Deck integration. |
| [Code Signing](docs/CODE_SIGNING.md) | Signing and notarization. |

## Contributing and support

Bug reports, feature requests, documentation improvements, and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

- [GitHub Issues](https://github.com/trevormarrr/showcall/issues) — bug reports and feature requests.
- [GitHub Discussions](https://github.com/trevormarrr/showcall/discussions) — questions and community discussion.

## License and credits

Created by **Trevor Marr**. Released under the [MIT License](LICENSE).

Built with Electron and the Resolume OSC and REST APIs, with Bitfocus Companion integration.

ShowCall is not affiliated with Resolume. Resolume Arena is a trademark of Resolume.
