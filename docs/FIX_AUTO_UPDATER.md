# 🚀 FIXING AUTO-UPDATER - TL;DR

## The Problem
Auto-updater fails because the app isn't code signed.

## The Solution
Set up 5 GitHub Secrets so GitHub Actions can sign the app when you push tags.

---

## 🎯 What You Need To Do (10 Minutes)

### Run This Script:
```bash
./scripts/github-signing-setup.sh
```

**What it does:**
1. ✅ Finds your Developer ID certificate
2. ✅ Gets your Team ID automatically
3. ✅ Exports certificate to base64 (copies to clipboard)
4. ✅ Updates package.json with your Team ID
5. ✅ Shows you exactly what to add to GitHub Secrets
6. ✅ Saves everything to `github-secrets-summary.txt`

### Then Add 5 Secrets to GitHub:

**Go to:** https://github.com/trevormarrr/showcall/settings/secrets/actions

**Click "New repository secret"** and add these 5:

1. **APPLE_ID** - Your Apple Developer email
2. **APPLE_APP_SPECIFIC_PASSWORD** - From appleid.apple.com (Security → Generate)
3. **APPLE_TEAM_ID** - From the script output
4. **CSC_LINK** - Paste from clipboard (script copies it)
5. **CSC_KEY_PASSWORD** - Password for your .p12 certificate

### Test It:
```bash
# Commit the changes
git add .
git commit -m "fix: enable code signing"
git push origin main

# Create new version
npm version patch
git push origin main --follow-tags

# Watch it build (should see "signing" and "notarizing" in logs)
# https://github.com/trevormarrr/showcall/actions
```

---

## ✅ Success = 
- GitHub Actions logs show: "✓ signing", "✓ notarizing"
- Release has .dmg and .zip files
- Auto-updater works for all future updates!

---

## 📚 Need More Details?

- **Quick checklist:** `GITHUB_SIGNING_CHECKLIST.md`
- **Complete guide:** `docs/CODE_SIGNING.md`
- **How it all works:** `docs/CODE_SIGNING_EXPLAINED.md`

---

## 💡 Remember

- ✅ Your credentials are ONLY for building (GitHub Actions)
- ✅ Users download signed apps (no setup needed)
- ✅ One-time setup, works forever
- ✅ Just push tags, GitHub does the rest!
