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

# 🎉 ShowCall v2.5.0 — Preset Banks

This update adds Preset Banks: an easy way to group presets, swap whole setups instantly, and share setups with your team.

What’s new for users

- Save related presets into a named bank (for example: "Sunday Morning", "Band A", "Lounge").
- Activate a bank to load all its presets into the Preset Deck at once.
- Export and import banks to move setups between machines or share with others.
- Banks work with existing cue stacks and presets — nothing gets lost when you switch banks.

Small quality-of-life improvements

- Smoother scrolling and spacing in Cue Stack for large lists.
- Packaging metadata and version info fixes so installers and updater show the right version.

How to publish this release on GitHub

1. Build your installer artifacts (see repo README).
2. Create a new release with tag `v2.5.0` and title "ShowCall v2.5.0 — Preset Banks".
3. Paste these release notes into the release body.
4. Upload the built artifacts (dmg / exe / AppImage) and publish the release.

Helpful links

- Full Changelog: https://github.com/trevormarrr/showcall/blob/main/CHANGELOG.md
- Documentation & guides: https://github.com/trevormarrr/showcall#readme
- Report issues: https://github.com/trevormarrr/showcall/issues

Enjoy the update — and let us know what preset banks you build! ✨
