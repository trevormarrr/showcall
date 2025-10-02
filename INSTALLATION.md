# Installation Guide

## macOS Installation

### Download
1. Go to [Releases](https://github.com/trevormarrr/showcall/releases)
2. Download the appropriate file for your Mac:
   - **Apple Silicon (M1/M2/M3)**: `ShowCall-1.0.0-arm64.dmg`
   - **Intel**: `ShowCall-1.0.0-x64.dmg`

### Install

1. **Open the DMG file**
2. **Drag ShowCall to Applications folder**

### First Launch - Security Warning

⚠️ **You may see: "ShowCall is damaged and can't be opened"**

This is NOT a virus! The app is unsigned because we don't have an Apple Developer certificate yet. macOS blocks all unsigned apps by default.

#### Fix Option 1: Remove Quarantine (Recommended)
Open Terminal and run:
```bash
xattr -cr /Applications/ShowCall.app
```

Then open ShowCall normally from Applications.

#### Fix Option 2: Right-Click Open
1. Go to Applications folder
2. **Right-click** (or Control+click) on ShowCall.app
3. Select **"Open"**
4. Click **"Open"** in the dialog
5. This permanently allows the app

#### Fix Option 3: System Settings
1. Try to open ShowCall (it will be blocked)
2. Go to **System Settings → Privacy & Security**
3. Scroll down to see **"ShowCall was blocked"**
4. Click **"Open Anyway"**
5. Try opening again and click **"Open"**

### Why This Happens

- ShowCall is open-source and free
- Apple code-signing requires a $99/year Developer account
- The app is safe - you can review the source code
- This is a common issue for open-source macOS apps

### Verify the App is Safe

You can verify the download matches the source code:
1. Check the [GitHub Actions build logs](https://github.com/trevormarrr/showcall/actions)
2. The build is automated and transparent
3. Review the source code in this repository

---

## Windows Installation

### Download
Download `ShowCall-Setup-1.0.0.exe` from [Releases](https://github.com/trevormarrr/showcall/releases)

### Install
1. **Run the installer**
2. Windows may show "Windows protected your PC"
3. Click **"More info"** → **"Run anyway"**
4. Follow installation prompts

### Why the Warning?
- Same reason as macOS - no code signing certificate yet
- Windows SmartScreen blocks unsigned apps by default
- The app is safe and open-source

---

## Linux Installation

### AppImage (Universal)
```bash
# Download
wget https://github.com/trevormarrr/showcall/releases/download/v1.0.0/ShowCall-1.0.0.AppImage

# Make executable
chmod +x ShowCall-1.0.0.AppImage

# Run
./ShowCall-1.0.0.AppImage
```

### Debian/Ubuntu (.deb)
```bash
# Download
wget https://github.com/trevormarrr/showcall/releases/download/v1.0.0/showcall_1.0.0_amd64.deb

# Install
sudo dpkg -i showcall_1.0.0_amd64.deb

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
