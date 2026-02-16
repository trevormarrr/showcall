#!/bin/bash
# ShowCall Code Signing Setup Helper
# Run this script to configure code signing for macOS builds

set -e

echo "🔐 ShowCall Code Signing Setup"
echo "================================"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Check for required tools
if ! command -v security &> /dev/null; then
    echo "❌ 'security' command not found. Install Xcode Command Line Tools:"
    echo "   xcode-select --install"
    exit 1
fi

echo "📋 This script will help you set up code signing for ShowCall."
echo "   You'll need:"
echo "   • Apple Developer account"
echo "   • Developer ID Application certificate in Keychain"
echo "   • Apple ID and app-specific password"
echo ""
read -p "Press Enter to continue..."

# Step 1: Find certificates
echo ""
echo "🔍 Step 1: Finding Developer ID certificates..."
echo ""

CERTS=$(security find-identity -v -p codesigning | grep "Developer ID Application")

if [ -z "$CERTS" ]; then
    echo "❌ No Developer ID Application certificates found!"
    echo ""
    echo "Please create one at:"
    echo "https://developer.apple.com/account/resources/certificates/list"
    echo ""
    echo "Then download and install it before running this script again."
    exit 1
fi

echo "✅ Found certificates:"
echo "$CERTS"
echo ""

# Step 2: Get Team ID
echo "🆔 Step 2: Team ID"
echo ""
echo "Find your Team ID at: https://developer.apple.com/account"
echo "Go to Membership → Team ID (looks like: AB1234CDEF)"
echo ""
read -p "Enter your Team ID: " TEAM_ID

if [ -z "$TEAM_ID" ]; then
    echo "❌ Team ID is required"
    exit 1
fi

# Step 3: Apple ID
echo ""
echo "📧 Step 3: Apple ID"
echo ""
read -p "Enter your Apple ID (email): " APPLE_ID

if [ -z "$APPLE_ID" ]; then
    echo "❌ Apple ID is required"
    exit 1
fi

# Step 4: App-Specific Password
echo ""
echo "🔑 Step 4: App-Specific Password"
echo ""
echo "Create one at: https://appleid.apple.com"
echo "Go to Security → App-Specific Passwords → Generate"
echo ""
read -p "Enter your app-specific password: " -s APP_PASSWORD
echo ""

if [ -z "$APP_PASSWORD" ]; then
    echo "❌ App-specific password is required"
    exit 1
fi

# Step 5: Export certificate
echo ""
echo "📜 Step 5: Export Certificate"
echo ""
echo "Select the certificate you want to use:"
echo "$CERTS"
echo ""
echo "This script will help you export it to a .p12 file."
echo ""
read -p "Press Enter to open Keychain Access..."

open -a "Keychain Access"

echo ""
echo "In Keychain Access:"
echo "1. Select 'login' keychain → 'My Certificates'"
echo "2. Find your Developer ID Application certificate"
echo "3. Right-click → Export"
echo "4. Save as: showcall-cert.p12"
echo "5. Set a password (you'll need it again)"
echo ""
read -p "Enter the path to your exported .p12 file: " P12_PATH

if [ ! -f "$P12_PATH" ]; then
    echo "❌ File not found: $P12_PATH"
    exit 1
fi

read -p "Enter the password you set for the .p12 file: " -s P12_PASSWORD
echo ""

if [ -z "$P12_PASSWORD" ]; then
    echo "❌ Certificate password is required"
    exit 1
fi

# Convert to base64
echo ""
echo "🔄 Converting certificate to base64..."
BASE64_CERT=$(base64 -i "$P12_PATH")

# Update package.json with Team ID
echo ""
echo "📝 Updating package.json..."

# Use sed to replace YOUR_TEAM_ID with actual team ID
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/YOUR_TEAM_ID/$TEAM_ID/g" package.json
else
    sed -i "s/YOUR_TEAM_ID/$TEAM_ID/g" package.json
fi

echo "✅ package.json updated with Team ID: $TEAM_ID"

# Create local .env for testing
echo ""
echo "💾 Creating .env file for local testing..."

cat > .env << EOF
# ShowCall Environment Configuration
PORT=3200
RESOLUME_HOST=10.1.110.146
RESOLUME_REST_PORT=8080
RESOLUME_OSC_PORT=7000
RESOLUME_EVENTS_PORT=8080
MOCK=0

# Code Signing (for local builds)
APPLE_ID=$APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD=$APP_PASSWORD
APPLE_TEAM_ID=$TEAM_ID
CSC_LINK=$P12_PATH
CSC_KEY_PASSWORD=$P12_PASSWORD
EOF

echo "✅ .env file created"

# Summary
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. For LOCAL builds:"
echo "   npm run dist"
echo "   (Will use the .env file created above)"
echo ""
echo "2. For GITHUB ACTIONS:"
echo "   Go to: https://github.com/trevormarrr/showcall/settings/secrets/actions"
echo "   Add these secrets:"
echo ""
echo "   APPLE_ID = $APPLE_ID"
echo "   APPLE_APP_SPECIFIC_PASSWORD = <the password you entered>"
echo "   APPLE_TEAM_ID = $TEAM_ID"
echo "   CSC_LINK = <paste the base64 below>"
echo "   CSC_KEY_PASSWORD = <the .p12 password>"
echo ""
echo "3. Base64 certificate (for CSC_LINK secret):"
echo "   (copied to clipboard)"
echo ""
echo "$BASE64_CERT" | pbcopy
echo "   ✅ Base64 certificate copied to clipboard!"
echo ""
echo "4. Test your build:"
echo "   npm run dist"
echo ""
echo "📚 Full documentation: docs/CODE_SIGNING.md"
echo ""
