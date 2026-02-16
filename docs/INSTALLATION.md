# Installation Guide

## macOS Installation

### Download
1. Go to [Releases](https://github.com/trevormarrr/showcall/releases)
2. Download the appropriate file for your Mac:
   - **Apple Silicon (M1/M2/M3/M4)**: `ShowCall-X.X.X-arm64.dmg`
   - **Intel**: `ShowCall-X.X.X.dmg` or `ShowCall-X.X.X-x64.dmg`

### Install

1. **Open the DMG file**
2. **Drag ShowCall to Applications folder** (shown in the installer window)
3. **Eject the DMG** after copying
4. **Open ShowCall** from Applications folder

### First Launch

**For signed versions (v2.3.3+):**
- Just double-click to open - no security warnings!
- Auto-updates will work automatically

**For older unsigned versions:**
- macOS may show "damaged" or security warning
- This is NOT a virus - it's because older versions weren't code-signed
- **Solution:** Download the latest version (signed & notarized)

### Verify the App is Safe

You can verify the download matches the source code:
1. Check the [GitHub Actions build logs](https://github.com/trevormarrr/showcall/actions)
2. The build is automated and transparent
3. Review the source code in this repository

---

## Windows Installation

### Download
Download `ShowCall-Setup-X.X.X.exe` from [Releases](https://github.com/trevormarrr/showcall/releases)

### Install
1. **Run the installer**
2. Windows may show "Windows protected your PC"
3. Click **"More info"** → **"Run anyway"**
4. Follow installation prompts
5. **Choose installation location** (optional)
6. **Create desktop shortcut** (recommended)

### Why the Warning?
- Same reason as macOS - no code signing certificate yet
- Windows SmartScreen blocks unsigned apps by default
- The app is safe and open-source

---

## Linux Installation

### AppImage (Universal)
```bash
# Download (replace X.X.X with latest version)
wget https://github.com/trevormarrr/showcall/releases/download/vX.X.X/ShowCall-X.X.X.AppImage

# Make executable
chmod +x ShowCall-X.X.X.AppImage

# Run
./ShowCall-X.X.X.AppImage
```

### Debian/Ubuntu (.deb)
```bash
# Download (replace X.X.X with latest version)
wget https://github.com/trevormarrr/showcall/releases/download/vX.X.X/showcall_X.X.X_amd64.deb

# Install
sudo dpkg -i showcall_X.X.X_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f

# Run
showcall
```

---

## After Installation

See [QUICKSTART.md](QUICKSTART.md) for setup instructions.

---

## Troubleshooting

### macOS: "damaged" or "can't be opened"
- Follow the steps above to remove quarantine or use right-click open

### Windows: "Windows protected your PC"
- Click "More info" → "Run anyway"

### Linux: Permission denied
- Run `chmod +x ShowCall*.AppImage`

### Still Having Issues?
- [Open an issue](https://github.com/trevormarrr/showcall/issues)
- Include your OS version and error message
- Check [existing issues](https://github.com/trevormarrr/showcall/issues) first

---

## Future: Code Signing

We plan to add proper code signing in the future. This requires:
- Apple Developer account ($99/year) for macOS
- Code signing certificate for Windows
- Community support/sponsorship would help cover these costs

For now, the workarounds above are safe and work perfectly.
