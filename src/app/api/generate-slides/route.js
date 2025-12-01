import { NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8001';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const topic = formData.get('topic') || 'TAFE Unit Presentation';
    const slideCount = parseInt(formData.get('slideCount') || '12');
    const theme = formData.get('theme') || 'modern';

    // Process uploaded files (if any)
    let documentPath = null;
    if (files && files.length > 0) {
      // In a full implementation, save the file temporarily
      // For now, we'll pass metadata
      documentPath = `/tmp/${files[0].name}`;
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

    return NextResponse.json(slides);

  } catch (error) {
    console.error('Slide generation error:', error);

    // If MCP server is unavailable, use fallback generation
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.warn('⚠️ MCP server not available, using fallback slide generation');
      
      const formData = await request.formData();
      const topic = formData.get('topic') || 'TAFE Unit Presentation';
      const slideCount = parseInt(formData.get('slideCount') || '12');
      
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
