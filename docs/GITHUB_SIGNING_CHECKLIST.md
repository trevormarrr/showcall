# GitHub Actions Code Signing Setup - Quick Checklist

## 🎯 Goal
Make sure GitHub Actions can sign your macOS builds when you push a new tag.

---

## ✅ What I've Already Done For You

1. ✅ Updated `package.json`:
   - Enabled `hardenedRuntime: true`
   - Enabled `notarize` with Team ID placeholder
   - Added entitlements configuration
   - Enabled DMG signing

2. ✅ Updated `.github/workflows/build.yml`:
   - Added environment variables for Apple credentials
   - Removed `CSC_IDENTITY_AUTO_DISCOVERY: false` (was blocking signing)

---

## 🔑 What You Need to Do (5 Steps)

### Step 1: Get Your Apple Developer Info

You need these 3 pieces of info from your Apple Developer account:

1. **Team ID**
   - Go to: https://developer.apple.com/account
   - Click **Membership**
   - Copy your **Team ID** (looks like `AB1234CDEF`)

2. **Apple ID** 
   - Your Apple Developer account email (e.g., `trevor@email.com`)

3. **App-Specific Password**
   - Go to: https://appleid.apple.com
   - Sign in → **Security** → **App-Specific Passwords**
   - Click **Generate** 
   - Label it: `ShowCall GitHub Actions`
   - Copy the password (looks like `abcd-efgh-ijkl-mnop`)

---

### Step 2: Export Your Code Signing Certificate

1. Open **Keychain Access** on your Mac
2. Select **login** keychain → **My Certificates**
3. Find: **Developer ID Application: [Your Name] ([Team ID])**
   
   ⚠️ **Don't have one?** 
   - Go to https://developer.apple.com/account/resources/certificates/list
   - Click **+** → Select **Developer ID Application**
   - Follow prompts to create and download
   - Double-click to install in Keychain
   - Then return to step 1

4. **Right-click** the certificate → **Export "Developer ID Application..."**
5. Save as: `showcall-cert.p12`
6. **Set a password** (remember this!)
7. Save somewhere secure

---

### Step 3: Convert Certificate to Base64

Open Terminal and run:

```bash
# Navigate to where you saved the .p12 file
cd ~/Downloads  # or wherever you saved it

# Convert to base64 and copy to clipboard
base64 -i showcall-cert.p12 | pbcopy

# ✅ Base64 certificate is now copied to clipboard!
```

---

### Step 4: Update package.json with Team ID

Open `package.json` and find line 76:

```json
"teamId": "YOUR_TEAM_ID"
```

Replace `YOUR_TEAM_ID` with your actual Team ID from Step 1.

Example:
```json
"teamId": "AB1234CDEF"
```

Save the file.

---

### Step 5: Add Secrets to GitHub

Go to your repo settings:
```
https://github.com/trevormarrr/showcall/settings/secrets/actions
```

Click **New repository secret** and add these 5 secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `APPLE_ID` | Your Apple ID email | Step 1 #2 |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password | Step 1 #3 |
| `APPLE_TEAM_ID` | Your Team ID | Step 1 #1 |
| `CSC_LINK` | Base64 certificate | Paste from clipboard (Step 3) |
| `CSC_KEY_PASSWORD` | .p12 password | Password from Step 2 #6 |

**Example:**
```
Name: APPLE_ID
Secret: trevor@example.com

Name: APPLE_APP_SPECIFIC_PASSWORD  
Secret: abcd-efgh-ijkl-mnop

Name: APPLE_TEAM_ID
Secret: AB1234CDEF

Name: CSC_LINK
Secret: MIIJ+AIBAzCCCb4GCSqGS... (very long base64 string)

Name: CSC_KEY_PASSWORD
Secret: YourCertificatePassword123
```

---

## 🚀 Testing It

Once you've added all 5 secrets:

```bash
# 1. Commit the package.json change
git add package.json .github/workflows/build.yml
git commit -m "fix: enable code signing for macOS builds"

# 2. Push to main
git push origin main

# 3. Create and push a new version tag
npm version patch  # This creates a tag like v2.3.3
git push origin main --follow-tags

# 4. Watch the build
# Go to: https://github.com/trevormarrr/showcall/actions
```

---

## ✅ Success Looks Like

In the GitHub Actions logs, you should see:

```
Building macOS targets...
  • signing         file=dist/mac/ShowCall.app identityName=Developer ID Application: Trevor Marr (AB1234CDEF)
  • notarizing      file=dist/ShowCall-2.3.3-mac.dmg
  • notarization successful
  • stapling        file=dist/ShowCall-2.3.3-mac.dmg
```

And in the release:
- ✅ `ShowCall-2.3.3-mac-x64.dmg` (signed)
- ✅ `ShowCall-2.3.3-mac-arm64.dmg` (signed)
- ✅ `ShowCall-2.3.3-mac.zip` (signed)
- ✅ `latest-mac.yml` (update manifest)

---

## 🎉 After This

- ✅ Users can download and run without security warnings
- ✅ Auto-updates will work properly
- ✅ Every future release will be automatically signed
- ✅ You just push tags, GitHub Actions does the rest!

---

## ❌ Common Issues

### "No signing identity found"
- Check: Did you add all 5 GitHub Secrets?
- Check: Is `CSC_LINK` the full base64 string?
- Check: Is `CSC_KEY_PASSWORD` correct?

### "Notarization failed"
- Check: Is `APPLE_ID` correct?
- Check: Is `APPLE_APP_SPECIFIC_PASSWORD` correct (not your regular password)?
- Check: Is `APPLE_TEAM_ID` correct?

### "teamId is required"
- Check: Did you replace `YOUR_TEAM_ID` in package.json?

---

## 📝 Quick Reference

Current workflow:
```bash
# Make code changes
git add .
git commit -m "feat: new feature"

# Create new release
npm version patch  # or minor/major
git push origin main --follow-tags

# GitHub Actions automatically:
# 1. Builds for macOS, Linux, Windows
# 2. Signs macOS with your certificate
# 3. Notarizes with Apple
# 4. Creates GitHub Release
# 5. Uploads all installers
```

That's it! 🚀
