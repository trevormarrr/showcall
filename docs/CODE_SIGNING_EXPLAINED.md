# Code Signing Explained: Who Needs What?

## 🤔 The Confusion: .env vs Distribution

**TL;DR:** Your `.env` with Apple credentials is ONLY used during the BUILD process. End users never need it, never see it, and it's never included in the distributed app.

---

## 📦 How It Works

### Phase 1: YOU Build the App (One-Time Setup)

**Where:** Your Mac or GitHub Actions  
**Who:** Only you (Trevor, the developer)  
**Needs:** Apple Developer credentials

```
┌─────────────────────────────────────────────────┐
│  YOUR BUILD MACHINE (or GitHub Actions)         │
│                                                  │
│  Environment Variables (YOUR credentials):      │
│  • APPLE_ID=trevor@email.com                    │
│  • APPLE_APP_SPECIFIC_PASSWORD=xxxx             │
│  • APPLE_TEAM_ID=AB1234CDEF                     │
│  • CSC_LINK=your-certificate.p12                │
│  • CSC_KEY_PASSWORD=cert_password               │
│                                                  │
│  electron-builder uses these to:                │
│  1. Sign the .app with your Developer ID       │
│  2. Notarize with Apple                        │
│  3. Create signed .dmg and .zip files          │
│                                                  │
│  Output: ShowCall-2.3.2-mac.dmg (SIGNED!)      │
└─────────────────────────────────────────────────┘
                      │
                      │ Upload to GitHub Releases
                      ▼
┌─────────────────────────────────────────────────┐
│  GITHUB RELEASES                                 │
│  https://github.com/trevormarrr/showcall        │
│                                                  │
│  • ShowCall-2.3.2-mac-x64.dmg                   │
│  • ShowCall-2.3.2-mac-arm64.dmg                 │
│  • ShowCall-2.3.2-mac.zip                       │
│                                                  │
│  All files are SIGNED with Trevor's identity    │
└─────────────────────────────────────────────────┘
```

**What happens here:**
- electron-builder uses YOUR Apple credentials
- Signs the app with YOUR Developer ID certificate
- Uploads the app to Apple for notarization
- Apple scans it, approves it, staples the notarization ticket
- The signed .dmg/.zip files are uploaded to GitHub Releases

**Important:** Your credentials are ONLY used during this build process. They are NOT included in the app!

---

### Phase 2: Users Download the App (No Setup Needed!)

**Where:** Any Mac  
**Who:** Random users (no Apple Developer account needed)  
**Needs:** Nothing! Just download and run

```
┌─────────────────────────────────────────────────┐
│  USER'S MAC (anywhere in the world)             │
│                                                  │
│  1. User downloads ShowCall-2.3.2-mac.dmg       │
│     from GitHub Releases                         │
│                                                  │
│  2. User opens the .dmg                         │
│                                                  │
│  3. macOS checks the signature:                 │
│     ✅ "Signed by: Trevor Marr (AB1234CDEF)"    │
│     ✅ "Notarized by Apple"                     │
│     ✅ "No tampering detected"                  │
│                                                  │
│  4. User drags to Applications                  │
│                                                  │
│  5. User opens ShowCall                         │
│     ✅ Opens immediately, no warnings!          │
│                                                  │
│  6. User configures THEIR Resolume settings:    │
│     • Resolume IP address                       │
│     • Resolume ports                            │
│     (in the app UI or their own .env)           │
│                                                  │
│  7. Auto-updates work automatically:            │
│     ShowCall checks GitHub for new versions     │
│     Downloads and validates signature           │
│     ✅ "Still signed by Trevor Marr"            │
│     Updates seamlessly                          │
└─────────────────────────────────────────────────┘
```

**What's in the distributed app:**
- ✅ ShowCall application code
- ✅ Digital signature (proves it's from you)
- ✅ Notarization ticket (proves Apple approved it)
- ❌ NO Apple Developer credentials
- ❌ NO .env file (unless user creates their own)
- ❌ NO signing certificates

---

## 🔐 What Gets Included in the Distributed App?

Let's look at what's actually inside the .dmg users download:

```
ShowCall-2.3.2-mac.dmg
└── ShowCall.app/
    ├── Contents/
    │   ├── Info.plist
    │   ├── MacOS/
    │   │   └── ShowCall (executable)
    │   ├── Resources/
    │   │   ├── app.asar (your code)
    │   │   ├── electron.asar
    │   │   └── ...
    │   ├── Frameworks/
    │   └── _CodeSignature/  ← SIGNATURE DATA (not credentials!)
    │       └── CodeResources
    └── [Notarization ticket stapled]

What's in _CodeSignature?:
• Hash of every file
• Your Developer ID (public info)
• Apple's approval (notarization)

What's NOT in there:
✗ Your Apple ID password
✗ Your certificate private key
✗ Your .env file
✗ Any secrets
```

---

## 🎯 The Key Concept: Build-Time vs Run-Time

### Build-Time (You/GitHub Actions)
```bash
# These environment variables are used DURING THE BUILD
APPLE_ID=trevor@email.com           # Used to notarize
APPLE_APP_SPECIFIC_PASSWORD=xxxx    # Used to notarize
APPLE_TEAM_ID=AB1234CDEF            # Used to sign
CSC_LINK=cert.p12                   # Your signing certificate
CSC_KEY_PASSWORD=password           # Certificate password

# electron-builder reads these, signs the app, then:
# 1. Creates signed ShowCall.app
# 2. Uploads to Apple for notarization
# 3. Packages into .dmg
# 4. Deletes all credential data
# 5. Only the SIGNATURE remains (public proof)
```

### Run-Time (End Users)
```bash
# Users might create their own .env for Resolume settings:
PORT=3200
RESOLUME_HOST=192.168.1.100  # Their Resolume IP
RESOLUME_REST_PORT=8080
RESOLUME_OSC_PORT=7000

# NO APPLE CREDENTIALS NEEDED OR INCLUDED!
```

---

## 🔄 Auto-Update Flow (How It Works for Users)

```
User's Mac with ShowCall installed:

1. ShowCall checks GitHub API:
   GET https://api.github.com/repos/trevormarrr/showcall/releases/latest
   Response: { "version": "2.3.3", "url": "..." }

2. New version found → Download:
   Downloads: ShowCall-2.3.3-mac.zip

3. electron-updater validates signature:
   ✓ Check: Is this signed by the same developer?
   ✓ Check: Is the signature valid?
   ✓ Check: Has the file been tampered with?
   
   If ALL checks pass → Install update
   If ANY check fails → Show error (what you saw!)

4. Update installed:
   Old: ShowCall 2.3.2 (signed by Trevor)
   New: ShowCall 2.3.3 (signed by Trevor)
   ✓ Signature match → Success!
```

**Why your update failed:**
- Old version: unsigned (no signature)
- New version: unsigned (no signature)
- electron-updater: "Wait, this says it should have a signature but doesn't!" ❌

**After you enable signing:**
- Old version: unsigned (users need manual update once)
- New version: SIGNED ✓
- Future updates: SIGNED → SIGNED ✓ (auto-update works!)

---

## 🛠️ Where Credentials Live

### GitHub Actions (Recommended for releases)

```yaml
# .github/workflows/build.yml
# Secrets are stored in GitHub Settings → Secrets
# Users NEVER see these, only GitHub's servers use them

env:
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  CSC_LINK: ${{ secrets.CSC_LINK }}
  CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}

# When you push a tag:
# 1. GitHub Actions runs on GitHub's servers
# 2. Uses YOUR credentials to sign
# 3. Uploads signed .dmg to releases
# 4. Credentials stay in GitHub's vault
```

### Your Local Mac (For testing)

```bash
# .env (in your repo, gitignored)
APPLE_ID=trevor@email.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx
# ... etc

# When you run: npm run dist
# 1. electron-builder reads .env
# 2. Signs the app
# 3. Creates dist/ShowCall-mac.dmg
# 4. You can test it locally
# 5. .env NEVER goes to users
```

---

## ✅ Summary: Who Needs What

| Person | Needs Apple Credentials? | What They Get |
|--------|-------------------------|---------------|
| **You (Trevor)** | ✅ YES (to build & sign) | Source code, credentials, can build |
| **GitHub Actions** | ✅ YES (via secrets) | Auto-builds signed releases |
| **End Users** | ❌ NO | Just download .dmg and run |
| **Contributors** | ❌ NO (if any) | Can run `npm run dev`, can't publish |

---

## 🎉 The Magic

Once you set up code signing:

1. **You build once** (with your credentials)
2. **Signature is embedded** in the app
3. **Users download signed app** (no setup needed)
4. **macOS trusts it** (because Apple verified your signature)
5. **Auto-updates work** (signature validates updates)
6. **Users are happy** (no security warnings!)

---

## 🚀 Next Steps for You

1. **One-time setup:**
   ```bash
   ./scripts/setup-code-signing.sh
   ```

2. **Add secrets to GitHub:**
   - Go to repo Settings → Secrets → Actions
   - Add the 5 secrets (script will tell you what to add)

3. **Build a new release:**
   ```bash
   npm version patch
   git push origin main --follow-tags
   ```

4. **GitHub Actions:**
   - Automatically builds with YOUR credentials
   - Creates signed .dmg
   - Publishes to releases

5. **Users:**
   - Download signed .dmg
   - No setup required
   - Auto-updates work forever!

---

**Bottom line:** Your Apple credentials are like a "stamp" that proves the app is from you. You use them once during build, the stamp goes on the app, and users see the stamp (signature) but never see your credentials.
