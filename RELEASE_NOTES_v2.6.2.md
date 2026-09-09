# ShowCall v2.6.2 - Release Notes

**Release Date:** September 8, 2026

## 🎯 What's Fixed

### 🔧 macOS release build was failing in CI
The `.github/workflows/build.yml` macOS job ran:

```bash
xcrun notarytool store-credentials "showcall-creds" \
  --apple-id "$APPLE_ID" --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD" --force
```

`notarytool store-credentials` doesn't support `--force`, so the command failed immediately and left the keychain in a bad state, which then caused the code-signing step to fail with `SecKeychainUnlock`.

The step has been removed entirely rather than just patching the flag: it stored a `showcall-creds` keychain profile that nothing in this repo ever reads back. Notarization already runs directly off the `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` secrets via electron-builder's built-in `mac.notarize` support (see `package.json`'s `build.mac.notarize.teamId`), so the manual keychain step was dead weight and the single point of failure.

No application code changed in this release — it exists purely to get a clean, signed/notarized macOS build published again.

## 📦 Installation

Download from [GitHub Releases](https://github.com/trevormarrr/showcall/releases/tag/v2.6.2)

- **macOS**: `ShowCall-2.6.2.dmg` (Intel + Apple Silicon)
- **Windows**: `ShowCall-Setup-2.6.2.exe`
- **Linux**: `ShowCall-2.6.2.AppImage` / `.deb`

### Auto-Update
If you're on a recent release (v2.3.4+), ShowCall's updater will offer this update automatically.

## ✅ What's Included

All v2.6.1 features and fixes, plus a working macOS release pipeline.

## 🔗 Helpful Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation: https://github.com/trevormarrr/showcall#readme
- Report Issues: https://github.com/trevormarrr/showcall/issues
