# ShowCall v2.6.2 Release Notes

## 🔧 What's Fixed in v2.6.2 — macOS Release Build Fix

This is a CI-only release with no application changes; it fixes the macOS build pipeline so signed/notarized installers can be published again.

- Removed an unsupported `--force` flag on `xcrun notarytool store-credentials` in the GitHub Actions workflow that was causing the macOS build job to fail, along with a downstream keychain unlock error.
- The credential-storage step itself was removed since notarization already runs directly off the `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` secrets via electron-builder's built-in notarization support.

## 📦 Download & Install

### macOS
Download `ShowCall-2.6.2.dmg` (Universal / Apple Silicon + Intel).

### Windows
Download `ShowCall-Setup-2.6.2.exe`.

### Linux
Download `ShowCall-2.6.2.AppImage`.

### Auto-Update
If you're on a recent release (v2.3.4+), ShowCall's updater will offer this update automatically.

## 🔗 Helpful Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation: https://github.com/trevormarrr/showcall#readme
- Report Issues: https://github.com/trevormarrr/showcall/issues

## ⬆️ Upgrading

Your presets, settings, and cue stacks are preserved. Import/export of banks is available for sharing setups.

---

Thanks for using ShowCall — if you run into any issues or have suggestions, open an issue and we'll help you out.
