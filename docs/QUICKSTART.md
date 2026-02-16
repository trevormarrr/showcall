# 🚀 ShowCall Quick Start

Get up and running with ShowCall in 5 minutes!

## Step 1: Download & Install (2 min)

### Download
Go to [Releases](https://github.com/trevormarrr/showcall/releases) and download for your platform:
- **macOS**: Download `.dmg` file (Apple Silicon or Intel)
- **Windows**: Download `.exe` installer  
- **Linux**: Download `.AppImage`

### Install
- **macOS**: Open DMG → Drag ShowCall to Applications → Double-click to open
- **Windows**: Run installer → Follow prompts
- **Linux**: `chmod +x ShowCall*.AppImage` then run

**Note:** Versions 2.3.3+ are properly signed - no security warnings!

## Step 2: Setup Resolume (2 min)

### Enable OSC (for control)
1. Open **Resolume Arena**
2. **Preferences** → **OSC** tab
3. ✅ **Enable OSC Input**
4. Input Port: **7000**
5. Note your IP address shown

### Enable Web Server (for monitoring)
1. **Preferences** → **Web Server** tab
2. ✅ **Enable Web Server**
3. Port: **8080**

## Step 3: Configure ShowCall (1 min)

ShowCall creates a `.env` file on first launch. You can:

**Option 1: Edit via UI (Easiest)**
1. Launch ShowCall
2. Look for connection status in top-right
3. If Resolume isn't detected, update the Resolume IP in the UI

**Option 2: Edit .env file**
1. Launch ShowCall once (creates `.env`)
2. Find `.env` in the app directory
3. Edit `RESOLUME_HOST` to your Resolume computer's IP:
   ```bash
   RESOLUME_HOST=10.1.110.146  # Replace with your IP
   RESOLUME_REST_PORT=8080
   RESOLUME_OSC_PORT=7000
   ```
4. Save and restart ShowCall

## Step 4: Run! (30 sec)

1. **Start ShowCall**
2. **Load a composition** in Resolume
3. **Check for**:
   - ✅ Green connection indicator (top right)
   - Composition name displayed
   - Grid populated with your clips

## Step 5: Test (30 sec)

1. **Click any clip** in the grid → Should trigger in Resolume
2. **Click "Test L1C1"** button → Should trigger Layer 1, Column 1
3. **Click "Clear All"** → Should clear all clips

## ✅ Success!

You're ready to use ShowCall! 

### Quick Tips
- **5×8 grid default** - Click "Show More" to expand
- **Column headers** - Click to trigger entire column
- **Empty cells** - Clips with no name appear blank
- **Keyboard shortcuts** - Configure in `config.json`

## ❌ Troubleshooting

### "Disconnected" Status
- ✅ Resolume is running?
- ✅ OSC Input enabled (port 7000)?
- ✅ Web Server enabled (port 8080)?
- ✅ Correct IP in `.env` file?
- ✅ Same network as Resolume computer?

### Grid Not Showing Clips
- Load a composition in Resolume
- Click **"Refresh Grid"** button
- Check composition has clips with names

### Triggers Not Working
- Check green "OSC" indicator (top right)
- Test in Resolume first (verify clips work)
- Click **"Test L1C1"** button for diagnostics

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **Configuration Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Report Issues**: [GitHub Issues](https://github.com/trevormarrr/showcall/issues)

---

**That's it! You're controlling Resolume remotely in 5 minutes! 🎉**
