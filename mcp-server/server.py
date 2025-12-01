from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from docx import Document
import PyPDF2

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="NotebookLM MCP Server Wrapper")

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print(f"✓ Gemini AI configured")
else:
    print("⚠️  Warning: GEMINI_API_KEY not found. Document-based generation will use fallback.")

class ToolCall(BaseModel):
    tool: str
    arguments: dict

@app.post("/")
async def handle_tool_call(call: ToolCall):
    """
    Handle incoming tool calls from the website.
    """
    print(f"Received tool call: {call.tool} with args: {call.arguments}")
    
    if call.tool == "generate_slides":
        return generate_slides(
            topic=call.arguments.get("topic", "Presentation"),
            document_path=call.arguments.get("document_path"),
            slide_count=call.arguments.get("slide_count", 10),
            theme=call.arguments.get("theme", "modern")
        )
    elif call.tool == "generate_mindmap":
        return generate_mindmap(
            topic=call.arguments.get("topic", "Mindmap"),
            document_path=call.arguments.get("document_path")
        )
    else:
        raise HTTPException(status_code=404, detail=f"Tool '{call.tool}' not found")

def extract_document_content(document_path: str) -> str:
    """
    Extract text content from various document formats
    """
    if not document_path or not os.path.exists(document_path):
        return ""
    
    file_ext = os.path.splitext(document_path)[1].lower()
    
    try:
        # DOCX files
        if file_ext == '.docx':
            doc = Document(document_path)
            text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            print(f"✓ Extracted {len(text)} characters from DOCX")
            return text
        
        # PDF files
        elif file_ext == '.pdf':
            with open(document_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ''
                for page in pdf_reader.pages:
                    text += page.extract_text() + '\n'
                print(f"✓ Extracted {len(text)} characters from PDF ({len(pdf_reader.pages)} pages)")
                return text
        
        # Text files
        elif file_ext in ['.txt', '.md', '.markdown']:
            with open(document_path, 'r', encoding='utf-8') as f:
                text = f.read()
            print(f"✓ Read {len(text)} characters from text file")
            return text
        
        else:
            print(f"⚠️  Unsupported file format: {file_ext}")
            return ""
            
    except Exception as e:
        print(f"⚠️  Could not read document: {e}")
        return ""

def generate_slides(topic: str, document_path: str, slide_count: int, theme: str):
    """
    Generate slides from document content using Google Gemini AI
    """
    print(f"Processing document at: {document_path}")
    
    # Extract document content with proper parsing
    document_content = extract_document_content(document_path)
    
    # Use Gemini AI if available and we have content
    if GEMINI_API_KEY and document_content:
        try:
            model = genai.GenerativeModel('gemini-3-pro-preview')
            
            prompt = f"""You are an expert TAFE (Technical and Further Education) curriculum developer.

Create a professional presentation with {slide_count} slides based on the following document content.

**Document Content:**
{document_content[:8000]}  # Limit to avoid token limits

**Requirements:**
1. Create exactly {slide_count} slides
2. Each slide should have:
   - A clear, descriptive title
   - 3-4 key points (bullet points)
   - A suggestion for an infographic/visual element
3. Make it relevant for TAFE educators and students
4. Focus on practical, actionable content
5. Use professional educational tone

**Output Format (JSON):**
{{
    "title": "{topic}",
    "slides": [
        {{
            "title": "Slide title here",
            "points": ["Point 1", "Point 2", "Point 3"],
            "infographic": "Description of visual element"
        }}
    ]
}}

Return ONLY valid JSON, no additional text."""

            response = model.generate_content(prompt)
            result_text = response.text
            
            # Clean up response (remove markdown code blocks if present)
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            # Parse JSON response
            slides_data = json.loads(result_text)
            print(f"✓ Generated {len(slides_data.get('slides', []))} slides using AI")
            return slides_data
            
        except Exception as e:
            print(f"⚠️  AI generation failed: {e}")
            print("Falling back to basic generation")
    
    # Fallback: Generate basic structure
    print("Using fallback generation")
    slides = []
    
    # If we have content, try to extract some info
    if document_content:
        # Split content into sections
        lines = [l.strip() for l in document_content.split('\n') if l.strip()]
        sections = lines[:slide_count * 3]  # Get some content for slides
        
        for i in range(1, min(slide_count + 1, len(sections) // 3 + 1)):
            start_idx = (i - 1) * 3
            slide_points = sections[start_idx:start_idx + 3] if start_idx < len(sections) else [
                f"Key concept {i}.1",
                f"Important detail {i}.2",
                f"Practical application {i}.3"
            ]
            
            slides.append({
                "title": f"Slide {i}: {lines[start_idx] if start_idx < len(lines) else f'Section {i}'}",
                "points": slide_points[:3],
                "infographic": f"Visual representation for slide {i}"
            })
    else:
        # No content available
        for i in range(1, slide_count + 1):
            slides.append({
                "title": f"Slide {i}: {topic}",
                "points": [
                    f"Key concept {i}.1",
                    f"Important detail {i}.2", 
                    f"Practical application {i}.3"
                ],
                "infographic": f"Visual representation for slide {i}"
            })
        
    return {"title": f"{topic} Presentation", "slides": slides}

def generate_mindmap(topic: str, document_path: str):
    """
    Generate a mind map from document content using Google Gemini AI
    """
    print(f"Generating mind map for: {topic}")
    
    # Extract document content with proper parsing
    document_content = extract_document_content(document_path)
    
    # Use Gemini AI if available and we have content
    if GEMINI_API_KEY and document_content:
        try:
            model = genai.GenerativeModel('gemini-3-pro-preview')
            
            prompt = f"""Create a hierarchical mind map from this content about "{topic}".

**Document Content:**
{document_content[:5000]}

**Requirements:**
1. Identify 5-8 main concepts (level 1 nodes)
2. For each main concept, identify 2-4 sub-concepts (level 2 nodes)
3. Keep labels concise (2-5 words)

**Output Format (JSON):**
{{
    "root": "{topic}",
    "nodes": [
        {{"id": "1", "label": "Concept name", "parent": "root"}},
        {{"id": "1.1", "label": "Sub-concept", "parent": "1"}}
    ]
}}

Return ONLY valid JSON."""

            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean markdown
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            mindmap_data = json.loads(result_text)
            print(f"✓ Generated mind map with {len(mindmap_data.get('nodes', []))} nodes")
            return mindmap_data
            
        except Exception as e:
            print(f"⚠️  AI generation failed: {e}")
            print("Falling back to basic mind map")
    
    # Fallback
    return {
        "root": topic,
        "nodes": [
            {"id": "1", "label": "Main Concept A", "parent": "root"},
            {"id": "2", "label": "Main Concept B", "parent": "root"},
            {"id": "3", "label": "Main Concept C", "parent": "root"}
        ]
    }

if __name__ == "__main__":
    # Run with: python server.py
    uvicorn.run(app, host="0.0.0.0", port=8001)
