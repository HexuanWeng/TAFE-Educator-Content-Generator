#!/bin/bash

# TAFE GEN - MCP Server Startup Script
# This script starts the Model Context Protocol server for document-based slide generation

echo "🚀 Starting TAFE GEN MCP Server..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.10 or higher"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Check if we're in the right directory
if [ ! -d "mcp-server" ]; then
    echo "❌ Error: mcp-server directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if dependencies are installed
echo ""
echo "Checking dependencies..."

if ! python3 -c "import fastapi; import google.generativeai" 2>/dev/null; then
    echo "⚠️  Dependencies not found. Installing..."
    cd mcp-server
    pip3 install -r requirements.txt
    cd ..
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check for .env file
if [ ! -f "mcp-server/.env" ]; then
    echo ""
    echo "⚠️  Warning: mcp-server/.env not found"
    if [ -f ".env.local" ]; then
        echo "Creating mcp-server/.env from .env.local..."
        grep "GEMINI_API_KEY" .env.local > mcp-server/.env
        echo "✓ Created mcp-server/.env"
    else
        echo "Please create mcp-server/.env with your GEMINI_API_KEY"
    fi
fi

# Start the server
echo ""
echo "========================================="
echo "🎯 Starting MCP Server on port 8001"
echo "========================================="
echo ""
echo "The server will handle:"
echo "  • Document-based slide generation"
echo "  • Mind map creation"
echo "  • Custom tool calls"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="
echo ""

cd mcp-server
python3 server.py
