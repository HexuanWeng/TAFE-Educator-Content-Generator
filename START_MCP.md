# Starting the MCP Server

The MCP (Model Context Protocol) server enables document-based slide generation. However, **it's now optional** - TAFE GEN will work without it using fallback generation.

## Option 1: Use Without MCP (Easiest)

Just use the slides feature normally. If the MCP server isn't running, you'll see a warning but slides will still be generated with a basic structure that you can customize.

## Option 2: Start MCP Server (For Document-Based Slides)

### Method 1: Using the Startup Script

```bash
# Make the script executable (only needed once)
chmod +x start-mcp.sh

# Run the script
./start-mcp.sh
```

### Method 2: Manual Start

```bash
# Navigate to mcp-server directory
cd mcp-server

# Install dependencies (if not already installed)
pip3 install -r requirements.txt

# Start the server
python3 server.py
```

### Method 3: Using npm script (Coming Soon)

```bash
npm run mcp
```

## Verify Server is Running

1. You should see output like:
   ```
   INFO:     Started server process [12345]
   INFO:     Uvicorn running on http://0.0.0.0:8001
   ```

2. The server will be available at: `http://localhost:8001`

3. In your Next.js terminal, you should see:
   ```
   🚀 USING MCP SERVER FOR SLIDE GENERATION
   ✅ Slides generated successfully via MCP server
   ```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>
```

### Dependencies Not Installed

```bash
cd mcp-server
pip3 install fastapi uvicorn requests
```

### Python Not Found

Install Python 3.10 or higher:
- macOS: `brew install python3`
- Windows: Download from python.org
- Linux: `sudo apt install python3`

## When Do You Need MCP?

| Feature | Without MCP | With MCP |
|---------|-------------|----------|
| Slide Generation | ✅ Basic structure | ✅ Document-based |
| Customization | ✅ Full editing | ✅ Full editing |
| Export | ✅ PowerPoint | ✅ PowerPoint |
| Mind Maps | ❌ Not available | ✅ Available |

## See Also

- [MCP Guide](./docs/MCP_GUIDE.md) - Complete MCP documentation
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
