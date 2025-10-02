# Code Signing Setup Guide

This guide will help you set up code signing for ShowCall using your Apple Developer account.

## 🎯 What Code Signing Does

- **Removes "damaged" errors** on macOS
- **Passes Gatekeeper** without user workarounds
- **Notarizes the app** with Apple
- **Professional distribution** ready

## 📋 Prerequisites

- ✅ Active Apple Developer account ($99/year)
- ✅ Admin access to your Mac
- ✅ Xcode installed (or at least Xcode Command Line Tools)

## 🔑 Step 1: Get Your Team ID

1. Go to https://developer.apple.com/account
2. Click on **Membership** in the sidebar
3. Find your **Team ID** (looks like `AB1234CDEF`)
4. Copy it - you'll need it for GitHub Secrets

## 🔐 Step 2: Create App-Specific Password

1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to **Security** → **App-Specific Passwords**
4. Click **Generate Password**
5. Enter label: `ShowCall GitHub Actions`
6. Copy the generated password (looks like `abcd-efgh-ijkl-mnop`)

## 📜 Step 3: Export Code Signing Certificate

### On Your Mac:

1. **Open Keychain Access**
2. Select **login** keychain → **My Certificates**
3. Find **Developer ID Application: Your Name (Team ID)**
   - If you don't have one, see "Create Certificate" section below
4. **Right-click** the certificate → **Export**
5. Save as: `showcall-cert.p12`
6. **Set a password** (you'll need this for GitHub)
7. Save the file securely

### Convert to Base64:

```bash
# In Terminal, navigate to where you saved the .p12 file
base64 -i showcall-cert.p12 | pbcopy
```

This copies the base64-encoded certificate to your clipboard.

## 🔒 Step 4: Add GitHub Secrets

1. Go to your GitHub repo: https://github.com/trevormarrr/showcall
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

### Add These Secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `APPLE_ID` | Your Apple ID email | `you@example.com` |
| `APPLE_APP_SPECIFIC_PASSWORD` | Password from Step 2 | `abcd-efgh-ijkl-mnop` |
| `APPLE_TEAM_ID` | Team ID from Step 1 | `AB1234CDEF` |
| `CSC_LINK` | Base64 certificate from Step 3 | Paste the base64 string |
| `CSC_KEY_PASSWORD` | Password you set in Step 3 | Your .p12 password |

## ✅ Step 5: Test the Build

### Local Test (Optional):
```bash
# Set environment variables
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop"
export APPLE_TEAM_ID="AB1234CDEF"
export CSC_LINK="/path/to/showcall-cert.p12"
export CSC_KEY_PASSWORD="your_p12_password"

# Build
npm run dist
```

### GitHub Actions Test:
```bash
# Commit and push the code signing changes
git add .
git commit -m "feat: add code signing for macOS"
git push origin main

# Create a new tag to trigger build
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0 (signed)"
git push origin v1.0.0
```

Watch the build at: https://github.com/trevormarrr/showcall/actions

## 🎉 What Happens Now

When the build succeeds:
1. ✅ App is **code signed** with your Developer ID
2. ✅ App is **notarized** by Apple
3. ✅ Users can **open directly** without security warnings
4. ✅ **No more "damaged" errors**

## 🛠️ Troubleshooting

### "No identity found"
- Make sure certificate is "Developer ID Application"
- Check it's not expired
- Verify you exported the private key with the certificate

### "Notarization failed"
- Check your Apple ID credentials
- Verify Team ID is correct
- Ensure app-specific password is valid

### Certificate Not in Keychain
See "Create Certificate" section below.

## 📝 Create Certificate (If Needed)

If you don't have a "Developer ID Application" certificate:

1. Go to https://developer.apple.com/account/resources/certificates/list
2. Click **+** to create new certificate
3. Select **Developer ID Application**
4. Follow the prompts to create CSR (Certificate Signing Request)
5. Download the certificate
6. Double-click to install in Keychain
7. Return to Step 3 above

## 🔄 Certificate Renewal

Apple certificates expire after 5 years:
1. Create new certificate (same process)
2. Export new .p12
3. Update `CSC_LINK` secret in GitHub
4. Trigger new build

## 💡 Additional Tips

### Keep Secrets Secure
- Never commit secrets to git
- Rotate app-specific passwords periodically
- Don't share your .p12 file

### Local Development
You don't need code signing for local `npm run dev` - it only matters for distribution builds.

### Windows Code Signing
If you want to sign Windows builds too, you'll need:
- Windows Code Signing Certificate (separate purchase)
- Add `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` secrets

## 📚 Resources

- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

---

**Once set up, all future releases will be automatically signed and notarized!** 🚀
