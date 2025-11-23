import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    // Note: In a full implementation, we would parse the files (PDF/DOCX) here.
    // For now, we will generate a high-quality presentation based on the context.

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview", // Using Gemini 3.0 as requested
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert educational content creator.
      Create a detailed presentation outline for a TAFE (Vocational Education) unit.
      
      Topic: Electrotechnology / General Trade Skills
      Target Audience: TAFE Students
      Slide Count: 12-15 slides

      Output JSON structure:
      {
        "title": "Presentation Title",
        "slides": [
          {
            "title": "Slide Title",
            "points": ["Key point 1", "Key point 2", "Key point 3"],
            "infographic": "Description of a visual/diagram for this slide"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const slides = JSON.parse(response.text());

    return NextResponse.json(slides);

  } catch (error) {
    console.error('Slide generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate slides.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
