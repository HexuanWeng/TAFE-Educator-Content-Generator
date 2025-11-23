import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { slides, theme } = await request.json();
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
      You are an expert TAFE educational content developer.
      Your task is to take a slide outline and expand it into a professional, high-quality presentation.
      
      Input Slides:
      ${JSON.stringify(slides)}

      Instructions:
      1. For each slide, keep the original title.
      2. Expand the "points" into detailed, educational content. 
         - Instead of brief bullets, write comprehensive sentences or short paragraphs that explain the concept clearly.
         - Ensure the tone is professional, instructional, and suitable for adult learners (TAFE level).
      3. Add "speakerNotes" for each slide. These should be detailed scripts or cues for the presenter to explain the slide content.
      4. Refine the "infographic" description to be more specific and visually descriptive for a designer or AI image generator.

      Output JSON structure:
      {
        "title": "${slides.title}",
        "slides": [
          {
            "title": "Slide Title",
            "content": [
              "Detailed point 1...",
              "Detailed point 2..."
            ],
            "speakerNotes": "Script for the presenter...",
            "infographic": "Detailed visual description..."
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const finalSlides = JSON.parse(response.text());

    return NextResponse.json(finalSlides);

  } catch (error) {
    console.error('Final slide generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate final slides.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
