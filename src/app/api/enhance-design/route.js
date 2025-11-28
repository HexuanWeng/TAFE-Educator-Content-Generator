import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { slides, currentTheme } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      You are "Nano Banana Pro", a world-class presentation designer known for creating "fancy", high-impact, and visually stunning slide decks.
      
      Your task is to take an existing slide deck content and a base theme, and generate a "Design Enhancement Specification" that will transform it into a premium presentation.

      Input Slides:
      ${JSON.stringify(slides)}

      Current Base Theme:
      ${JSON.stringify(currentTheme)}

      Instructions:
      1. Analyze the content and the current theme.
      2. Create a refined "Advanced Theme" that improves upon the current colors and fonts. 
         - Suggest a more sophisticated color palette (hex codes).
         - Suggest premium font pairings (standard web fonts or Google Fonts).
      3. For EACH slide, suggest a specific "Layout" and "Visual Elements".
         - Layouts: "split-left", "split-right", "centered-hero", "grid-2-col", "grid-3-col", "quote-focus".
         - Visual Elements: Describe shapes, gradients, or decorative elements that should be added (e.g., "Add a subtle gradient overlay in the bottom right", "Use a semi-transparent circle behind the title").

      Output JSON structure:
      {
        "designName": "Nano Banana Pro - [Creative Name]",
        "theme": {
          "primary": "#HEX",
          "secondary": "#HEX",
          "accent": "#HEX",
          "background": "#HEX",
          "text": "#HEX",
          "slideBg": "#HEX",
          "fonts": { "heading": "Font Name", "body": "Font Name" }
        },
        "slideDesigns": [
          {
            "slideIndex": 0,
            "layout": "centered-hero",
            "visualNotes": "Description of visual enhancements..."
          }
          // ... one for each slide
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const designSpecs = JSON.parse(response.text());

        return NextResponse.json(designSpecs);

    } catch (error) {
        console.error('Design enhancement error:', error);
        return NextResponse.json(
            {
                error: 'Failed to enhance design.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
