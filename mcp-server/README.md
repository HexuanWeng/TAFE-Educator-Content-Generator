# MCP Server

This directory contains the Model Context Protocol (MCP) server for TAFE GEN, enabling document-based content generation with AI.

## Quick Start

### 1. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 2. Configure Environment

Copy the `.env` file from parent directory or create one:

```bash
# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

Or copy from parent:
```bash
cp ../.env.local ./.env
```

### 3. Start the Server

```bash
python3 server.py
```

You should see:
```
✓ Gemini AI configured
INFO:     Uvicorn running on http://0.0.0.0:8001
```

## Features

### Available Tools

#### 1. `generate_slides`
Generate presentation slides from uploaded documents.

**How it works:**
1. Reads uploaded document content
2. Uses Google Gemini AI to analyze content
3. Generates structured slide outline
4. Returns JSON with title, points, and visual suggestions

**Example Request:**
```json
{
  "tool": "generate_slides",
  "arguments": {
    "topic": "TAFE Curriculum",
    "document_path": "/path/to/document.txt",
    "slide_count": 12,
    "theme": "modern"
  }
}
```

#### 2. `generate_mindmap`
Create mind maps from document content.

**How it works:**
1. Reads uploaded document
2. Identifies main concepts and relationships
3. Generates hierarchical node structure
4. Returns JSON with root and nodes

## Architecture

```
Next.js Upload File
    ↓
Save to temp/ directory
    ↓
Pass path to MCP Server
    ↓
MCP Server reads file
    ↓
Gemini AI analyzes content
    ↓
Generate structured output
    ↓
Return JSON to Next.js
    ↓
Next.js deletes temp file
```

## Requirements

- Python 3.9+
- FastAPI
- Uvicorn
- Google Generative AI SDK
- Access to GEMINI_API_KEY

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 8001
lsof -i :8001

# Kill it
kill -9 <PID>
```

### Dependencies Not Found

```bash
pip3 install -r requirements.txt --upgrade
```

### API Key Not Working

1. Check `.env` file exists in this directory
2. Verify `GEMINI_API_KEY` is set correctly
3. Test the key at https://aistudio.google.com/

### File Not Found Errors

- Ensure Next.js is saving files to the `temp/` directory
- Check file permissions
- Verify absolute paths are used

## Development

### Adding New Tools

1. Define function in `server.py`
2. Register in `handle_tool_call()`
3. Update Next.js to call the new tool
4. Document in this README

Example:
```python
def your_new_tool(arg1: str, arg2: int):
    # Your implementation
    return {"result": "data"}

# Register in handler:
elif call.tool == "your_new_tool":
    return your_new_tool(
        arg1=call.arguments.get("arg1"),
        arg2=call.arguments.get("arg2")
    )
```

## See Also

- [MCP Guide](../docs/MCP_GUIDE.md) - Complete usage guide
- [Deployment Guide](../docs/DEPLOYMENT.md) - Production deployment
- [Main README](../README.md) - Project overview
