import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8001';

export async function POST(request) {
  // Parse formData once at the top level
  let formData;
  let files;
  let topic;
  let slideCount;
  let theme;
  
  try {
    formData = await request.formData();
    files = formData.getAll('files');
    topic = formData.get('topic') || 'TAFE Unit Presentation';
    slideCount = parseInt(formData.get('slideCount') || '12');
    theme = formData.get('theme') || 'modern';
  } catch (parseError) {
    return NextResponse.json(
      {
        error: 'Failed to parse request',
        details: parseError.message
      },
      { status: 400 }
    );
  }
  
  try {
    // Process uploaded files (if any)
    let documentPath = null;
    let documentContent = '';
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp');
      try {
        await fs.mkdir(tempDir, { recursive: true });
      } catch (err) {
        console.log('Temp directory already exists');
      }
      
      // Save file temporarily
      documentPath = path.join(tempDir, `${Date.now()}-${file.name}`);
      
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(documentPath, buffer);
        
        // Try to read as text for logging
        try {
          documentContent = await file.text();
          console.log(`✓ Saved file: ${file.name} (${documentContent.length} chars)`);
        } catch {
          console.log(`✓ Saved binary file: ${file.name}`);
        }
        
        console.log(`✓ Document saved to: ${documentPath}`);
      } catch (saveError) {
        console.error('Error saving file:', saveError);
        documentPath = null;
      }
    }

    console.log('========================================');
    console.log('🚀 USING MCP SERVER FOR SLIDE GENERATION');
    console.log('========================================');
    console.log('MCP Server URL:', MCP_SERVER_URL);
    console.log('Request params:', { topic, slideCount, theme, documentPath });

    // Call MCP server to generate slides
    const mcpResponse = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'generate_slides',
        arguments: {
          topic,
          document_path: documentPath,
          slide_count: slideCount,
          theme
        }
      })
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP server returned ${mcpResponse.status}: ${await mcpResponse.text()}`);
    }

    const slides = await mcpResponse.json();
    console.log('✅ Slides generated successfully via MCP server');
    console.log('Generated', slides.slides?.length || 0, 'slides');
    console.log('========================================');

    // Clean up temporary file
    if (documentPath) {
      try {
        await fs.unlink(documentPath);
        console.log('✓ Cleaned up temporary file');
      } catch (cleanupError) {
        console.warn('Could not clean up temp file:', cleanupError.message);
      }
    }

    return NextResponse.json(slides);

  } catch (error) {
    console.error('Slide generation error:', error);

    // If MCP server is unavailable, use fallback generation
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.warn('⚠️ MCP server not available, using fallback slide generation');
      
      // Use already-parsed values (don't read formData again!)
      // Fallback: Generate basic slide structure
      const slides = [];
      for (let i = 1; i <= slideCount; i++) {
        slides.push({
          title: `Slide ${i}: ${i === 1 ? 'Introduction' : i === slideCount ? 'Summary' : `Section ${i - 1}`}`,
          points: [
            `Key concept ${i}.1`,
            `Important detail ${i}.2`,
            `Practical application ${i}.3`
          ],
          infographic: `Visual representation for slide ${i}`
        });
      }
      
      return NextResponse.json({
        title: topic,
        slides: slides,
        fallback: true,
        warning: 'Generated with basic structure. For document-based slides, start MCP server: cd mcp-server && python3 server.py'
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to generate slides.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
