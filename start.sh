#!/bin/bash

# WebAuthn Conditional Create Demo Startup Script

echo "🚀 Starting WebAuthn Conditional Create Demo..."
echo ""

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 2. Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Start the server in background
echo "🖥️  Starting Express server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# 5. Check if ngrok is available, if not install it
if ! command -v ngrok &> /dev/null; then
    echo "📡 Installing ngrok..."
    npm install -g ngrok
fi

# 6. Start ngrok and capture the URL
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 --log=stdout > ngrok.log &
NGROK_PID=$!

# Wait for ngrok to start
sleep 5

# 7. Extract the HTTPS URL from ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Please check ngrok status."
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# 8. Extract domain from URL
DOMAIN=$(echo $NGROK_URL | sed 's/https:\/\///')

# 9. Update main.js with the ngrok domain
echo "🔧 Updating RP ID to: $DOMAIN"
sed -i.bak "s/id: \"[^\"]*\"/id: \"$DOMAIN\"/" main.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Public URL: $NGROK_URL"
echo "🔒 RP ID updated to: $DOMAIN"
echo ""
echo "📋 Next steps:"
echo "1. Open $NGROK_URL in Chrome"
echo "2. Make sure Google Password Manager is set up"
echo "3. Test the login form and save password to GPM"
echo "4. Try the conditional create feature"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    # Restore original main.js
    if [ -f main.js.bak ]; then
        mv main.js.bak main.js
    fi
    rm -f ngrok.log
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Press Ctrl+C to stop the servers"
wait