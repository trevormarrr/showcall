# 🚨 macOS Security Warning - Not a Virus!

## The Issue

When you download and try to open ShowCall on macOS, you may see:

**"ShowCall is damaged and can't be opened. You should move it to the Trash."**

## Why This Happens

- ShowCall is **NOT damaged or infected**
- This is macOS Gatekeeper blocking unsigned applications
- Apple requires a $99/year Developer account to sign apps
- ShowCall is free and open-source, so we haven't purchased signing yet

## ✅ Safe Solutions (Choose One)

### Option 1: Remove Quarantine Flag (Easiest)
```bash
# Open Terminal and run:
xattr -cr /Applications/ShowCall.app
```
Then open ShowCall normally.

### Option 2: Right-Click Open
1. Go to Applications folder
2. **Right-click** ShowCall.app
3. Select **"Open"**
4. Click **"Open"** in the security dialog

### Option 3: System Settings
1. Try to open ShowCall (will be blocked)
2. Open **System Settings → Privacy & Security**
3. Find **"ShowCall was blocked"**
4. Click **"Open Anyway"**
5. Try opening ShowCall again

## Is It Safe?

✅ **Yes!** Here's why you can trust it:

1. **Open Source**: All code is public on GitHub
2. **Transparent Builds**: GitHub Actions builds are public and auditable
3. **No Hidden Code**: You can review every line before installing
4. **Community Verified**: Anyone can inspect the build process

## Verify the Download

Check that your download matches the official build:
1. View [GitHub Actions logs](https://github.com/trevormarrr/showcall/actions)
2. Compare file sizes and checksums
3. Review the source code

## Future Plans

We're considering:
- Community-sponsored code signing certificate
- Building trust through usage and reviews
- Possible sponsorship/donation model to fund signing

For now, the workarounds above work perfectly and are completely safe!

---

**Need more help?** See [INSTALLATION.md](INSTALLATION.md) for detailed instructions.
