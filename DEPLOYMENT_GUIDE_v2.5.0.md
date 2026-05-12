````markdown
# 🚀 GitHub Release Deployment Guide - v2.5.0

## ✅ Completed Steps

- ✅ Code committed to main branch
- ✅ Tag v2.5.0 created and pushed
- ✅ Release notes prepared
- ✅ All changes tested locally

---

## 📦 Next Steps: Create GitHub Release

### 1. Build Distribution Files

Run this command to build all platform installers:
```bash
cd /Users/trevormarr/Apps/showcall
npm run dist
```

This will create files in the `dist/` folder:
- macOS: `ShowCall-2.5.0-arm64.dmg` (Apple Silicon)
- macOS: `ShowCall-2.5.0.dmg` (Intel)
- macOS: `ShowCall-2.5.0-mac.zip` (both architectures)
- Windows: `ShowCall Setup 2.5.0.exe`
- Linux: `ShowCall-2.5.0.AppImage`

### 2. Create GitHub Release

1. **Go to GitHub Releases:**
   - Navigate to: https://github.com/trevormarrr/showcall/releases
   - Click **"Draft a new release"**

2. **Configure the Release:**
   - **Choose a tag:** Select `v2.5.0` from dropdown
   - **Release title:** `ShowCall v2.5.0 - Production Release`
   - **Description:** Copy the contents from `GITHUB_RELEASE_NOTES_v2.5.0.md`

3. **Upload Build Artifacts:**
   Drag and drop these files from your `dist/` folder:
   - `ShowCall-2.5.0-arm64.dmg` → macOS Apple Silicon
   - `ShowCall-2.5.0.dmg` → macOS Intel
   - `ShowCall-2.5.0-mac.zip` → macOS Universal
   - `ShowCall Setup 2.5.0.exe` → Windows
   - `ShowCall-2.5.0.AppImage` → Linux

4. **Set as Latest Release:**
   - ✅ Check "Set as the latest release"
   - Leave "Pre-release" unchecked

5. **Publish:**
   - Click **"Publish release"**

---

## 📋 Release Notes Template

The full release notes are in: **`GITHUB_RELEASE_NOTES_v2.5.0.md`**

Just copy and paste that entire file into the GitHub release description!

### Quick Summary for Social Media:

```
🎉 ShowCall v2.5.0 is live!

✨ What's new:
• Polished Cue Stack UX and performance tweaks
• Improved packaging metadata for macOS
• Documentation refresh and version updates to 2.5.0

Perfect for worship, theater, concerts & events!

Download: https://github.com/trevormarrr/showcall/releases/tag/v2.5.0
```

---

## 🔍 Post-Release Checklist

After publishing the release:

- [ ] Verify download links work
- [ ] Test auto-updater (install v2.4.3, should see v2.5.0 update notification)
- [ ] Check release appears on main repo page
- [ ] Verify all platform installers work:
  - [ ] macOS DMG installs and launches
  - [ ] Windows EXE installs and launches
  - [ ] Linux AppImage runs
- [ ] Update any external links (website, social media, etc.)

---

## 📁 Important Files Reference

All these files are ready in your repo:

| File | Purpose |
|------|---------|
| `GITHUB_RELEASE_NOTES_v2.5.0.md` | Copy this into GitHub release |
| `RELEASE_NOTES.md` | User-facing release notes in repo |
| `CHANGELOG.md` | Technical changelog (updated) |
| `README.md` | Main readme (rewritten) |
| `V2.5.0_CHANGES.md` | Developer change summary |
| `RELEASE_SUMMARY_v2.5.0.md` | Complete implementation summary |

---

## 🎯 Key Features to Highlight

When promoting this release, emphasize:

1. Polished Cue Stack UX and performance tweaks
2. Improved packaging metadata for macOS
3. Documentation updates and version consistency
4. Complete v2.5 milestone readiness

---

## 💡 Tips

**GitHub Release Best Practices:**
- ✅ Use the formatted markdown from `GITHUB_RELEASE_NOTES_v2.5.0.md`
- ✅ Include screenshots/GIFs if you have them
- ✅ Clearly mark breaking changes (if any)
- ✅ Provide upgrade instructions
- ✅ List all platform downloads

**Auto-Updater:**
- Users on v2.3.4+ will see the update automatically
- Uses the tag version from GitHub releases
- No need to manually notify users!

---

## 🚨 Troubleshooting

**If build fails:**
```bash
# Clean and rebuild
rm -rf dist/
rm -rf node_modules/
npm install
npm run dist
```

**If code signing fails (macOS):**
- Check that environment variables are set:
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
  - `APPLE_TEAM_ID`
- See `docs/CODE_SIGNING.md` for details

**If GitHub tag is wrong:**
```bash
# Delete tag locally and remotely
git tag -d v2.5.0
git push origin :refs/tags/v2.5.0

# Recreate and push
git tag -a v2.5.0 -m "Your message"
git push origin v2.5.0
```

---

## ✅ Final Status

**Git Status:**
- ✅ Committed: `7e953ec`
- ✅ Tagged: `v2.5.0`
- ✅ Pushed to: `main` branch
- ✅ Tag pushed to GitHub

**Ready for:**
- ⏳ Build distribution files (`npm run dist`)
- ⏳ Create GitHub release
- ⏳ Upload artifacts
- ⏳ Publish release

---

**Good luck with the release! 🎉**

Once you publish, users on v2.3.4+ will automatically be notified of the update within 24 hours (or when they restart the app).

````