#!/bin/bash

# ShowCall Preset Sync Test Script
# Tests the preset synchronization feature between ShowCall and Companion

echo "🧪 ShowCall Preset Sync Test"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_api() {
    echo -n "Testing $1... "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$2")
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test WebSocket message
test_websocket() {
    echo "Testing WebSocket preset sync..."
    # This is a placeholder - actual WebSocket testing requires wscat or similar
    echo -e "${YELLOW}⚠ MANUAL TEST REQUIRED${NC}"
    echo "  1. Open Companion"
    echo "  2. Check logs for 'presets_updated' message"
    echo "  3. Verify presets appear in 'ShowCall Presets' category"
}

# Check if ShowCall server is running
echo "Checking if ShowCall server is running..."
if curl -s http://localhost:3200/api/presets > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ShowCall server is running${NC}"
else
    echo -e "${RED}✗ ShowCall server is NOT running${NC}"
    echo "Please start ShowCall first: npm run dev"
    exit 1
fi

echo ""
echo "Running API Tests:"
echo "-------------------"

# Test 1: Get presets
test_api "GET /api/presets" "http://localhost:3200/api/presets"

# Test 2: Get composition
test_api "GET /api/composition" "http://localhost:3200/api/composition"

# Test 3: Get status
test_api "GET /api/status" "http://localhost:3200/api/status"

echo ""
echo "Testing Preset Management:"
echo "-------------------"

# Test 4: Save a test preset
echo -n "Creating test preset... "
TEST_PRESET='{
  "presets": [
    {
      "id": "test_preset",
      "label": "Test Preset",
      "color": "#ff0000",
      "macro": [
        {"type": "clear"},
        {"type": "sleep", "ms": 100},
        {"type": "cut"}
      ]
    }
  ]
}'

RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_PRESET" \
  -o /dev/null -w "%{http_code}" \
  http://localhost:3200/api/presets)

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    
    # Verify preset was saved
    echo -n "Verifying preset was saved... "
    SAVED=$(curl -s http://localhost:3200/api/presets | grep -o "test_preset")
    if [ ! -z "$SAVED" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $RESPONSE)"
    ((TESTS_FAILED++))
fi

echo ""
echo "Manual Tests Required:"
echo "-------------------"
test_websocket

echo ""
echo "Companion Module Tests:"
echo "-------------------"
echo -e "${YELLOW}MANUAL TESTS:${NC}"
echo "  1. Install Companion module:"
echo "     cd showcall-companion && npm run build"
echo ""
echo "  2. Add ShowCall connection in Companion:"
echo "     Host: localhost, Port: 3200"
echo ""
echo "  3. Check Companion logs for:"
echo "     ✅ 'Connected to ShowCall'"
echo "     ✅ 'Presets updated from ShowCall: X presets'"
echo ""
echo "  4. Verify in Companion Buttons:"
echo "     ✅ 'ShowCall Presets' category exists"
echo "     ✅ Test Preset button appears"
echo "     ✅ Button has red background"
echo ""
echo "  5. Test execution:"
echo "     ✅ Drag button to Stream Deck"
echo "     ✅ Press button"
echo "     ✅ Check ShowCall logs for execution"

echo ""
echo "File Structure Tests:"
echo "-------------------"

# Check for required files
FILES=(
    "server.mjs"
    "public/app.js"
    "PRESET_SYNC_GUIDE.md"
    "UPDATE_V1.4.0.md"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✓${NC} $FILE exists"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $FILE missing"
        ((TESTS_FAILED++))
    fi
done

# Check Companion files
COMPANION_FILES=(
    "../showcall-companion/main.js"
    "../showcall-companion/PRESET_INTEGRATION.md"
)

for FILE in "${COMPANION_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✓${NC} $FILE exists"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $FILE missing"
        ((TESTS_FAILED++))
    fi
done

echo ""
echo "Code Verification:"
echo "-------------------"

# Check for key code changes
echo -n "Checking for preset broadcast in server.mjs... "
if grep -q "broadcastToCompanion" server.mjs && grep -q "presets_updated" server.mjs; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking for preset sync in Companion main.js... "
if grep -q "presets_updated" ../showcall-companion/main.js && grep -q "showcallPresets" ../showcall-companion/main.js; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking for execute_preset action... "
if grep -q "execute_preset" ../showcall-companion/main.js; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "================================"
echo "Test Results:"
echo "--------------------------------"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo "================================"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Complete manual Companion tests above"
    echo "2. Test on real Stream Deck hardware"
    echo "3. Create a preset in ShowCall UI"
    echo "4. Verify it appears on Stream Deck"
    echo "5. Test preset execution from Stream Deck"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review and fix.${NC}"
    exit 1
fi
