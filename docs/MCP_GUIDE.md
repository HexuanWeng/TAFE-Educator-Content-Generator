# Model Context Protocol (MCP) Guide

## 📋 Table of Contents

- [What is MCP?](#what-is-mcp)
- [Why Use MCP in TAFE GEN?](#why-use-mcp-in-tafe-gen)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [Using MCP for Slide Generation](#using-mcp-for-slide-generation)
- [MCP Server API Reference](#mcp-server-api-reference)
- [Extending MCP with Custom Tools](#extending-mcp-with-custom-tools)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## 🤔 What is MCP?

**Model Context Protocol (MCP)** is an open standard that enables AI applications to securely connect to external data sources and tools. Think of it as a universal adapter that allows your AI agents to interact with various services, databases, and APIs in a standardized way.

### Key Benefits

- **Standardized Communication** - Consistent interface for tool interactions
- **Security** - Controlled access to external resources
- **Extensibility** - Easy to add new tools and capabilities
- **Separation of Concerns** - AI logic separated from data sources

---

## 💡 Why Use MCP in TAFE GEN?

TAFE GEN uses MCP to enable advanced slide generation capabilities with **document-grounded context**. Instead of generating slides from scratch, the MCP server can:

1. **Read uploaded documents** (workbooks, PDFs, presentations)
2. **Extract key information** using AI analysis
3. **Generate contextually accurate slides** based on actual content
4. **Reduce hallucinations** by grounding in real data

### Use Case: Presentation Generation

```
User uploads workbook.docx
    ↓
Next.js app sends to MCP server
    ↓
MCP server processes document
    ↓
AI generates slide outline from content
    ↓
Slides returned to user
```

---

## 🏗️ Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TAFE GEN Web Application                 │
│                    (Next.js Frontend + API)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP POST
                      │ /generate_slides
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    MCP Server (FastAPI)                     │
│                    Port 8001                                │
│                                                             │
│  Tools:                                                     │
│  ├─ generate_slides()    ── Slide generation               │
│  ├─ generate_mindmap()   ── Mind map creation              │
│  └─ [Add custom tools]   ── Extensible                     │
│                                                             │
│  Optional Integration:                                      │
│  └─ NotebookLM API       ── Enhanced document analysis     │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **MCP Server** (`mcp-server/server.py`)
   - FastAPI-based HTTP server
   - Handles tool calls from Next.js app
   - Processes documents and generates responses
   - Port: 8001

2. **Next.js Integration** (`src/app/api/generate-slides/route.js`)
   - Sends requests to MCP server
   - Handles file uploads
   - Manages error states
   - Falls back gracefully if server unavailable

3. **Tools** (defined in `server.py`)
   - `generate_slides` - Create presentation slides
   - `generate_mindmap` - Create mind maps
   - Extensible for additional tools

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Navigate to the MCP server directory and install Python packages:

```bash
cd mcp-server
pip install -r requirements.txt
```

Or install dependencies individually:

```bash
pip install fastapi uvicorn requests
```

**Requirements:**
- Python 3.10 or higher
- pip package manager

### Step 2: Start the MCP Server

Open a **separate terminal window** and run:

```bash
python mcp-server/server.py
```

You should see output like:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

**Important:** Keep this terminal window open while using TAFE GEN.

### Step 3: Configure Next.js Application

The Next.js app automatically connects to the MCP server at `http://localhost:8001`.

To customize the MCP server URL, set an environment variable:

```bash
# .env.local
MCP_SERVER_URL=http://localhost:8001
```

### Step 4: Verify Connection

1. Start your Next.js app:
   ```bash
   npm run dev
   ```

2. Navigate to the Slides page: `http://localhost:3000/slides`

3. Upload a document and click "Generate Slide Outline"

4. Check the MCP server terminal for log messages:
   ```
   Received tool call: generate_slides with args: {...}
   Processing document at: /path/to/document.docx
   ```

---

## 📊 Using MCP for Slide Generation

### Workflow Overview

1. **Upload Document** - User uploads teaching materials
2. **API Call** - Next.js sends request to MCP server
3. **Document Processing** - MCP server analyzes content
4. **Slide Generation** - AI creates structured slides
5. **Response** - Slides returned as JSON
6. **Preview & Edit** - User reviews and modifies slides
7. **Export** - Download as PowerPoint

### Frontend Implementation

#### Uploading and Generating Slides

```javascript
// src/app/slides/page.js

const handleGenerate = async () => {
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    // Call Next.js API route
    const response = await fetch('/api/generate-slides', {
        method: 'POST',
        body: formData
    });
    
    const slides = await response.json();
    setSlides(slides);
};
```

#### API Route Integration

```javascript
// src/app/api/generate-slides/route.js

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8001';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Save file temporarily
    const filePath = await saveFile(file);
    
    // Call MCP server
    const mcpResponse = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tool: 'generate_slides',
            arguments: {
                topic: 'TAFE Curriculum',
                document_path: filePath,
                slide_count: 10,
                theme: 'modern'
            }
        })
    });
    
    const slides = await mcpResponse.json();
    return NextResponse.json(slides);
}
```

### Example Response

```json
{
    "title": "TAFE Curriculum Presentation",
    "slides": [
        {
            "title": "Slide 1: Introduction",
            "points": [
                "Overview of unit competencies",
                "Learning outcomes and objectives",
                "Assessment requirements"
            ],
            "infographic": "Visual representation of course structure"
        },
        {
            "title": "Slide 2: Key Concepts",
            "points": [
                "Performance criteria breakdown",
                "Industry standards and regulations",
                "Practical applications"
            ],
            "infographic": "Concept map diagram"
        }
    ]
}
```

---

## 🔌 MCP Server API Reference

### Endpoint: `/` (POST)

Send tool calls to the MCP server.

#### Request Format

```json
{
    "tool": "generate_slides",
    "arguments": {
        "topic": "Presentation Title",
        "document_path": "/path/to/document.docx",
        "slide_count": 10,
        "theme": "modern"
    }
}
```

#### Available Tools

### 1. `generate_slides`

Generate presentation slides from a document.

**Arguments:**
- `topic` (string) - Presentation title/topic
- `document_path` (string) - Path to source document
- `slide_count` (integer, default: 10) - Number of slides to generate
- `theme` (string, default: "modern") - Visual theme

**Response:**
```json
{
    "title": "Presentation Title",
    "slides": [
        {
            "title": "Slide Title",
            "points": ["Point 1", "Point 2", "Point 3"],
            "infographic": "Visual description"
        }
    ]
}
```

### 2. `generate_mindmap`

Create a mind map from document content.

**Arguments:**
- `topic` (string) - Central topic/root node
- `document_path` (string) - Path to source document

**Response:**
```json
{
    "root": "Central Topic",
    "nodes": [
        {
            "id": "1",
            "label": "Concept A",
            "parent": "root"
        },
        {
            "id": "2",
            "label": "Concept B",
            "parent": "root"
        }
    ]
}
```

---

## 🛠️ Extending MCP with Custom Tools

### Adding a New Tool

#### Step 1: Define the Tool Function

Edit `mcp-server/server.py` and add your tool:

```python
def generate_quiz(topic: str, document_path: str, question_count: int):
    """
    Generate quiz questions from a document.
    
    Args:
        topic: Quiz topic/title
        document_path: Path to source document
        question_count: Number of questions to generate
        
    Returns:
        Dictionary containing quiz data
    """
    # Read document content
    with open(document_path, 'r') as f:
        content = f.read()
    
    # Process with AI (pseudo-code)
    questions = []
    for i in range(question_count):
        questions.append({
            "question": f"Question {i+1}",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Explanation text"
        })
    
    return {
        "title": f"{topic} Quiz",
        "questions": questions
    }
```

#### Step 2: Register the Tool

Add the tool to the request handler:

```python
@app.post("/")
async def handle_tool_call(call: ToolCall):
    if call.tool == "generate_slides":
        return generate_slides(...)
    elif call.tool == "generate_mindmap":
        return generate_mindmap(...)
    elif call.tool == "generate_quiz":
        return generate_quiz(
            topic=call.arguments.get("topic"),
            document_path=call.arguments.get("document_path"),
            question_count=call.arguments.get("question_count", 10)
        )
    else:
        raise HTTPException(status_code=404, detail=f"Tool '{call.tool}' not found")
```

#### Step 3: Call from Next.js

Create an API route:

```javascript
// src/app/api/generate-quiz/route.js

export async function POST(request) {
    const { document } = await request.json();
    
    const mcpResponse = await fetch('http://localhost:8001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tool: 'generate_quiz',
            arguments: {
                topic: 'TAFE Assessment',
                document_path: document,
                question_count: 20
            }
        })
    });
    
    const quiz = await mcpResponse.json();
    return NextResponse.json(quiz);
}
```

### Example Tools You Could Add

1. **`extract_learning_objectives`** - Extract learning outcomes from curriculum
2. **`generate_lesson_plan`** - Create structured lesson plans
3. **`create_flashcards`** - Generate study flashcards
4. **`summarize_document`** - Create executive summaries
5. **`identify_key_concepts`** - Extract main concepts and definitions
6. **`generate_activities`** - Create classroom activities

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Refused Error

**Error:** `MCP server is not running`

**Solution:**
```bash
# Make sure the server is running
cd mcp-server
python server.py

# Check if port 8001 is available
lsof -i :8001
```

#### 2. Module Not Found Error

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Reinstall dependencies
pip install -r mcp-server/requirements.txt

# Or install individually
pip install fastapi uvicorn requests
```

#### 3. Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or change the port in server.py
uvicorn.run(app, host="0.0.0.0", port=8002)  # Use different port
```

#### 4. File Not Found Error

**Error:** `Document path not found`

**Solution:**
- Ensure files are saved to a persistent location
- Check file permissions
- Verify the path is absolute, not relative

#### 5. Timeout Error

**Error:** `Request timeout`

**Solution:**
- Increase timeout in Next.js fetch call
- Optimize document processing in MCP server
- Use async processing for large files

### Debugging Tips

#### Enable Verbose Logging

```python
# mcp-server/server.py

import logging
logging.basicConfig(level=logging.DEBUG)

@app.post("/")
async def handle_tool_call(call: ToolCall):
    logging.debug(f"Received: {call}")
    # ... rest of code
```

#### Test MCP Server Directly

```bash
# Test with curl
curl -X POST http://localhost:8001 \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "generate_slides",
    "arguments": {
      "topic": "Test",
      "document_path": "/path/to/doc.txt",
      "slide_count": 5
    }
  }'
```

#### Monitor Server Logs

Watch the terminal where `server.py` is running for real-time logs:
```
Received tool call: generate_slides with args: {...}
Processing document at: /path/to/doc
✅ Generated 5 slides successfully
```

---

## ⚙️ Advanced Configuration

### Production Deployment

#### Using Environment Variables

```bash
# .env.production
MCP_SERVER_URL=https://mcp.your-domain.com
MCP_API_KEY=your_secure_api_key
```

```python
# mcp-server/server.py

API_KEY = os.getenv("MCP_API_KEY")

@app.post("/")
async def handle_tool_call(call: ToolCall, api_key: str = Header(None)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    # ... rest of code
```

#### Running with Docker

Create `mcp-server/Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

Build and run:

```bash
cd mcp-server
docker build -t tafe-mcp-server .
docker run -p 8001:8001 tafe-mcp-server
```

#### Using with PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start mcp-server/server.py --name tafe-mcp --interpreter python3

# Monitor
pm2 logs tafe-mcp

# Stop
pm2 stop tafe-mcp
```

### Integrating NotebookLM (Future Implementation)

To integrate with Google's NotebookLM for enhanced document analysis:

```python
# mcp-server/server.py

from notebooklm import NotebookLMClient  # Hypothetical SDK

client = NotebookLMClient(api_key=os.getenv("NOTEBOOKLM_API_KEY"))

def generate_slides(topic: str, document_path: str, slide_count: int, theme: str):
    # Upload document to NotebookLM
    notebook = client.create_notebook(name=topic)
    notebook.upload_document(document_path)
    
    # Query for slide content
    prompt = f"Generate {slide_count} slides about {topic} from the uploaded document"
    response = notebook.query(prompt)
    
    # Parse and structure response
    slides = parse_notebook_response(response)
    
    return {"title": topic, "slides": slides}
```

### Performance Optimization

#### Caching Responses

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def generate_slides_cached(doc_hash: str, topic: str, slide_count: int):
    # Implementation
    pass

def generate_slides(topic: str, document_path: str, slide_count: int, theme: str):
    # Create hash of document
    with open(document_path, 'rb') as f:
        doc_hash = hashlib.md5(f.read()).hexdigest()
    
    return generate_slides_cached(doc_hash, topic, slide_count)
```

#### Async Processing

```python
from fastapi import BackgroundTasks

@app.post("/async")
async def async_tool_call(call: ToolCall, background_tasks: BackgroundTasks):
    task_id = generate_task_id()
    background_tasks.add_task(process_tool_call, task_id, call)
    return {"task_id": task_id, "status": "processing"}

@app.get("/status/{task_id}")
async def check_status(task_id: str):
    # Return task status
    pass
```

---

## 📚 Additional Resources

### MCP Protocol Documentation
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol)

### Related TAFE GEN Documentation
- [Main README](../README.md) - Project overview
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Agent Concepts](./AGENT_CONCEPTS.md) - AI agent patterns

### FastAPI Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Server](https://www.uvicorn.org/)

---

## 🤝 Contributing

To contribute improvements to the MCP implementation:

1. Create a new tool in `server.py`
2. Add corresponding API route in Next.js
3. Update this documentation
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

Proprietary. All rights reserved.

---

<div align="center">

**Empowering TAFE Educators with AI Tools**

[Back to Main Documentation](../README.md)

</div>
