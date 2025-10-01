#!/bin/bash
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then npm install; fi
#!/bin/bash

# ShowCall - Resolume Arena Controller Launch Script
# This script starts the ShowCall application

echo "🎬 ShowCall - Resolume Arena Controller"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating default .env file..."
    cat > .env << EOF
PORT=3200
MOCK=0
RESOLUME_HOST=10.1.110.72
RESOLUME_PORT=8080
RESOLUME_STATUS_PATH=/api/v1/composition
RESOLUME_TRIGGER_TEMPLATE=/api/v1/composition/layers/{layer}/clips/{column}/connect
RESOLUME_TRIGGER_COLUMN_TEMPLATE=/api/v1/composition/columns/{column}/connect
RESOLUME_CUT_PATH=/api/v1/transport/resync
RESOLUME_CLEAR_PATH=/api/v1/composition/disconnectall
EOF
    echo "✅ Created .env file with default settings"
    echo "📝 Edit .env file to configure your Resolume connection"
fi

echo ""
echo "🚀 Starting ShowCall..."
echo "📍 Web interface: http://localhost:3200"
echo "🎛️  Resolume target: $(grep RESOLUME_HOST .env | cut -d'=' -f2):$(grep RESOLUME_PORT .env | cut -d'=' -f2)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the application
npm run dev
sleep 2
open http://localhost:3200
