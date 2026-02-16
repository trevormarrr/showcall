#!/bin/bash
# Quick script to get your Team ID and prepare certificate for GitHub

set -e

echo "🔐 ShowCall - GitHub Actions Code Signing Setup"
echo "================================================"
echo ""

# Check for macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

echo "This script will help you get the information needed for GitHub Secrets."
echo ""
echo "You'll need:"
echo "  • Apple Developer account"
echo "  • Developer ID Application certificate in Keychain"
echo ""
read -p "Press Enter to continue..."

# Step 1: Check for certificates
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 Step 1: Finding your Developer ID certificate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CERTS=$(security find-identity -v -p codesigning | grep "Developer ID Application" || true)

if [ -z "$CERTS" ]; then
    echo "❌ No Developer ID Application certificates found!"
    echo ""
    echo "Create one at:"
    echo "https://developer.apple.com/account/resources/certificates/list"
    echo ""
    echo "Steps:"
    echo "1. Click '+' to create new certificate"
    echo "2. Select 'Developer ID Application'"
    echo "3. Follow prompts to create CSR"
    echo "4. Download and double-click to install"
    echo "5. Run this script again"
    exit 1
fi

echo "✅ Found certificate(s):"
echo "$CERTS"
echo ""

# Extract Team ID from certificate
TEAM_ID=$(echo "$CERTS" | grep -o '([A-Z0-9]\{10\})' | tr -d '()' | head -1)

if [ -n "$TEAM_ID" ]; then
    echo "✅ Team ID found: $TEAM_ID"
else
    echo "⚠️  Could not auto-detect Team ID"
    echo "Find it at: https://developer.apple.com/account → Membership"
    read -p "Enter your Team ID manually: " TEAM_ID
fi

# Step 2: Get Apple ID
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Step 2: Apple ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Enter your Apple ID (email): " APPLE_ID

# Step 3: App-Specific Password
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Step 3: App-Specific Password"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Create one at: https://appleid.apple.com"
echo "Go to: Security → App-Specific Passwords → Generate"
echo ""
read -p "Do you want to open the page now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://appleid.apple.com"
    echo "✅ Opened in browser"
fi
echo ""
read -p "Enter your app-specific password: " -s APP_PASSWORD
echo ""

# Step 4: Export certificate
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 4: Export Certificate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening Keychain Access..."
echo ""
echo "In Keychain Access:"
echo "1. Select 'login' keychain → 'My Certificates'"
echo "2. Find: Developer ID Application: [Your Name]"
echo "3. Right-click → Export"
echo "4. Save as: showcall-cert.p12"
echo "5. Set a password (you'll need it for GitHub)"
echo ""

open -a "Keychain Access"
read -p "Press Enter when you've exported the certificate..."

echo ""
read -p "Enter the full path to the .p12 file (drag and drop): " P12_PATH
# Remove quotes if user dragged and dropped
P12_PATH=$(echo "$P12_PATH" | tr -d "'\"")

if [ ! -f "$P12_PATH" ]; then
    echo "❌ File not found: $P12_PATH"
    exit 1
fi

echo ""
read -p "Enter the password you set for the .p12 file: " -s P12_PASSWORD
echo ""

# Convert to base64
echo ""
echo "🔄 Converting certificate to base64..."
BASE64_CERT=$(base64 -i "$P12_PATH")
echo "$BASE64_CERT" | pbcopy
echo "✅ Base64 certificate copied to clipboard!"

# Update package.json
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 5: Updating package.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "YOUR_TEAM_ID" package.json; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/YOUR_TEAM_ID/$TEAM_ID/g" package.json
    else
        sed -i "s/YOUR_TEAM_ID/$TEAM_ID/g" package.json
    fi
    echo "✅ package.json updated with Team ID: $TEAM_ID"
else
    echo "ℹ️  Team ID already set in package.json"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete! Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to GitHub → Settings → Secrets → Actions:"
echo "https://github.com/trevormarrr/showcall/settings/secrets/actions"
echo ""
echo "Add these 5 secrets:"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│ 1. APPLE_ID                                        │"
echo "│    Value: $APPLE_ID"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│ 2. APPLE_APP_SPECIFIC_PASSWORD                     │"
echo "│    Value: $APP_PASSWORD"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│ 3. APPLE_TEAM_ID                                   │"
echo "│    Value: $TEAM_ID"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│ 4. CSC_LINK                                        │"
echo "│    Value: (paste from clipboard - already copied!) │"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "┌────────────────────────────────────────────────────┐"
echo "│ 5. CSC_KEY_PASSWORD                                │"
echo "│    Value: $P12_PASSWORD"
echo "└────────────────────────────────────────────────────┘"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary saved to: github-secrets-summary.txt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save to file for reference
cat > github-secrets-summary.txt << EOF
GitHub Secrets for ShowCall Code Signing
=========================================

Add these at: https://github.com/trevormarrr/showcall/settings/secrets/actions

1. APPLE_ID
   $APPLE_ID

2. APPLE_APP_SPECIFIC_PASSWORD
   $APP_PASSWORD

3. APPLE_TEAM_ID
   $TEAM_ID

4. CSC_LINK
   (Use the base64 string that was copied to your clipboard)

5. CSC_KEY_PASSWORD
   $P12_PASSWORD

Next Steps
==========

1. Add all 5 secrets to GitHub
2. Commit changes:
   git add package.json
   git commit -m "fix: enable code signing for macOS"
   git push origin main

3. Create new release:
   npm version patch
   git push origin main --follow-tags

4. Watch the build:
   https://github.com/trevormarrr/showcall/actions

Generated: $(date)
EOF

echo "✅ You can reference this file later if needed"
echo ""
echo "🚀 After adding secrets to GitHub, test with:"
echo "   npm version patch"
echo "   git push origin main --follow-tags"
echo ""
echo "Full guide: GITHUB_SIGNING_CHECKLIST.md"
echo ""
