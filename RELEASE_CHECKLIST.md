# ShowCall - Release Preparation Checklist

## ✅ Completed

### Documentation
- [x] Updated README.md with user-friendly instructions
- [x] Created LICENSE file (MIT)
- [x] Created CHANGELOG.md with v1.0.0 release notes
- [x] Created CONTRIBUTING.md with development guidelines
- [x] Created .env.example for users to copy
- [x] Added build/README.md with icon instructions

### Repository Configuration
- [x] Updated package.json with repository URLs
- [x] Updated package.json with keywords for discoverability
- [x] Added author and license info
- [x] Enhanced electron-builder config for all platforms
- [x] Added macOS entitlements for proper signing

### GitHub Integration
- [x] Created GitHub Actions workflow for automated builds
- [x] Configured release automation on version tags
- [x] Multi-platform build support (macOS, Windows, Linux)

### Code Cleanup
- [x] Updated .gitignore to exclude dev notes
- [x] Proper file structure for distribution
- [x] Fixed layer ordering (Layer 1 at bottom)
- [x] Cleaned up invalid clip name handling
- [x] Optimized grid view with expand controls

## 📋 Before First Release

### 1. Create App Icons (Optional but Recommended)
```bash
# Add these files to build/ directory:
# - icon.icns (macOS)
# - icon.ico (Windows) 
# - icon.png (Linux)
```

For now, builds will use default Electron icon. Can update later.

### 2. Commit and Push Changes
```bash
git add .
git commit -m "chore: prepare for v1.0.0 release"
git push origin main
```

### 3. Create Release Tag
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This will trigger GitHub Actions to build for all platforms!

### 4. Monitor Build
- Go to: https://github.com/trevormarrr/showcall/actions
- Watch the build process
- Downloads will be available in: https://github.com/trevormarrr/showcall/releases

## 🚀 Release Process

### Automatic (Recommended)
1. Tag a version: `git tag -a v1.0.0 -m "Release v1.0.0"`
2. Push tag: `git push origin v1.0.0`
3. GitHub Actions automatically builds all platforms
4. Creates GitHub Release with installers attached

### Manual (If needed)
```bash
# Build for your current platform
npm run dist

# Installers will be in dist/ folder
# Upload manually to GitHub Releases
```

## 📦 Distribution Files

After build completes, users can download:

### macOS
- `ShowCall-1.0.0.dmg` - Drag-to-install disk image
- `ShowCall-1.0.0-mac.zip` - Portable zip archive

### Windows  
- `ShowCall Setup 1.0.0.exe` - NSIS installer
- `ShowCall 1.0.0.exe` - Portable executable

### Linux
- `ShowCall-1.0.0.AppImage` - Universal portable app
- `showcall_1.0.0_amd64.deb` - Debian package

## 🎯 Post-Release

### Announce Release
- GitHub Release notes (auto-generated)
- Update project description
- Share with community

### Monitor Issues
- Watch for bug reports
- Respond to user questions
- Plan v1.1.0 improvements

## 🔄 Future Releases

### Version Bumping
```bash
# Update version in package.json
npm version patch  # 1.0.0 → 1.0.1 (bug fixes)
npm version minor  # 1.0.0 → 1.1.0 (new features)
npm version major  # 1.0.0 → 2.0.0 (breaking changes)

# Push tag
git push origin --tags
```

### Update CHANGELOG.md
Add new entries under appropriate version headers.

## 📝 Notes

- **Console logs**: Kept for debugging. Consider LOG_LEVEL env var in future.
- **Icons**: Using default Electron icons until custom ones created.
- **Code signing**: Not configured yet (requires Apple Developer account).
- **.env file**: Not committed (users create from .env.example).
- **Dev notes**: Excluded via .gitignore (FIXED.md, OSC_WORKING.md, etc).

## ✨ Ready to Release!

Everything is prepared for your first release. When ready:

```bash
git add .
git commit -m "chore: prepare for v1.0.0 release"
git push origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Then monitor builds at: https://github.com/trevormarrr/showcall/actions

---

Quick v1.0.0 steps:
- Update `package.json` version to `1.0.0`
- Commit and push to `main`
- Tag and push: `git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0`
- Wait for the GitHub Release to publish installers in the Releases page
