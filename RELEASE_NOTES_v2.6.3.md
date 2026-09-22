# ShowCall v2.6.3

### Better bank control. A deck that stays in sync.

This release fixes bank switching in the pop-out deck and makes preset management more flexible. Reorder presets with drag-and-drop, create additional banks, and keep your deck aligned with the bank you're using.

[**Download v2.6.3 →**](https://github.com/trevormarrr/showcall/releases/tag/v2.6.3) · [Documentation](https://github.com/trevormarrr/showcall#readme) · [Report an issue](https://github.com/trevormarrr/showcall/issues)

---

## ✨ New in this release

### Drag-and-drop preset ordering

Arrange presets in the order you need them. Use the drag handle in the preset list to move a preset within its bank—your new order saves automatically when you drop it.

Addresses [#4 — Reorder presets in a bank](https://github.com/trevormarrr/showcall/issues/4).

### Add and remove banks

You're no longer limited to five preset banks.

- Select **+ Add Bank** to create a bank.
- Choose **Delete Bank** from a bank's menu to remove it.
- The last remaining bank is protected from deletion, so you always have one available.

Existing installations migrate automatically to the updated bank storage format.

## 🔧 Fixes

### Pop-out deck follows the active bank

The pop-out deck now displays the selected bank instead of staying stuck on Bank 1. Its header shows the bank name, and the deck stays synchronized when you switch banks, save presets, rename or clear a bank, or delete a bank.

Fixes [#3 — Pop-out deck stuck on Bank 1](https://github.com/trevormarrr/showcall/issues/3).

### Bank renaming prompts only once

Removed a duplicate rename prompt that made the **Rename Bank** button appear unresponsive. Renaming now asks for the new name once.

---

## 📦 Download and install

Choose your installer from the [v2.6.3 release page](https://github.com/trevormarrr/showcall/releases/tag/v2.6.3).

| Platform | Installer | Installation |
| --- | --- | --- |
| **macOS** | `ShowCall-2.6.3.dmg` | Universal build for Apple Silicon and Intel. Open the disk image and drag ShowCall into Applications. |
| **Windows** | `ShowCall-Setup-2.6.3.exe` | Run the installer. |
| **Linux** | `ShowCall-2.6.3.AppImage` | Make the file executable, then launch it. |

> **Already using ShowCall?** Versions **v2.3.4 and later** will offer this release through the built-in updater.

## ⬆️ Upgrading

Your **presets, settings, and cue stacks are preserved** during the update. Existing banks migrate automatically; no manual conversion is needed. Bank import and export remain available for sharing setups.

<details>
<summary><strong>Developer details</strong></summary>

### Active bank synchronization

Previously, `deck.html` fetched `/api/presets` once, which defaulted to Bank 1. It now reads the active bank on initial load and subscribes to updates through Server-Sent Events (SSE).

| Endpoint | Purpose |
| --- | --- |
| `GET /api/banks/active` | Read the active bank on initial load. |
| `GET /api/banks/active/stream` | Subscribe to active-bank updates. |
| `POST /api/banks` | Create a bank. |
| `DELETE /api/banks/:id` | Delete a bank, unless it is the last remaining bank. |

`server.mjs` broadcasts updates when banks are switched, saved, renamed, cleared, or deleted.

### Preset ordering and bank storage

- `renderPresetList` in `app.js` uses native HTML5 drag-and-drop, with a drag handle and visual feedback while dragging.
- Dropping a preset saves the updated order through the existing `/api/presets` endpoint.
- Bank metadata now uses a dynamic `bankIds` list, with automatic migration for existing installations.
- The duplicate prompt was removed from the rename flow so the click handler and `renameBank()` no longer both ask for a name.

</details>

---

[Full changelog](https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md) · [Documentation](https://github.com/trevormarrr/showcall#readme) · [Issues and feedback](https://github.com/trevormarrr/showcall/issues)

Thanks for using ShowCall. Found a bug or have an idea? Open an issue—we'd love to hear from you.
