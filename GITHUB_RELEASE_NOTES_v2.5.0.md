# 🎯 ShowCall v2.5.0 - Production Release

This release prepares ShowCall for the 2.5 milestone with polishing, minor feature improvements, and documentation updates.

## ✨ Highlights

- ✅ Polished Cue Stack UX: small UI improvements and performance tweaks for large cue lists
- ✅ Improved auto-update metadata and packaging hints for the macOS DMG
- ✅ Documentation refresh: README, RELEASE_NOTES, and CHANGELOG updated to v2.5.0
- ✅ Version bump: package.json, UI header, and published docs now show v2.5.0

## 🔧 Notes for release packaging

- macOS: `ShowCall-2.5.0-arm64.dmg` (Apple Silicon) and `ShowCall-2.5.0.dmg` (Intel)
- Windows: `ShowCall-Setup-2.5.0.exe`
- Linux: `ShowCall-2.5.0.AppImage`

## ⬆️ Upgrading

Existing presets, settings, and cue stacks are preserved. Auto-updater will offer this update for users on recent releases.

## 🧾 Links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation: https://github.com/trevormarrr/showcall#readme
- Report Issues: https://github.com/trevormarrr/showcall/issues

---

Release checklist:

- [ ] Build macOS DMG and upload to GitHub release
- [ ] Build Windows installer and upload
- [ ] Build Linux AppImage and upload
- [ ] Create Git tag `v2.5.0` and push
- [ ] Publish GitHub release using this markdown as the release body
