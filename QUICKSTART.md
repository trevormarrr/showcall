# 🚀 ShowCall Quick Start

Get up and running with ShowCall in 5 minutes!

## Step 1: Download & Install (2 min)

### Download
Go to [Releases](https://github.com/trevormarrr/showcall/releases) and download for your platform:
- **macOS**: Download `.dmg` file
- **Windows**: Download `.exe` installer  
- **Linux**: Download `.AppImage`

### Install
- **macOS**: Open DMG → Drag ShowCall to Applications
- **Windows**: Run installer → Follow prompts
- **Linux**: `chmod +x ShowCall*.AppImage` then run

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

1. **Launch ShowCall** for the first time
2. **Quit the app** (it creates the `.env` file)
3. **Find the .env file**:
   - macOS: Right-click app → Show Package Contents → `.env`
   - Or check your home directory
4. **Edit .env** with your Resolume IP:
   ```bash
   RESOLUME_HOST=YOUR_RESOLUME_IP_HERE
   ```
5. **Save and close**

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
