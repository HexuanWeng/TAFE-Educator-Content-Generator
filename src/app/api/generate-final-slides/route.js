import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateFinalSlides } from '@/data/prompts';

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

    const prompt = generateFinalSlides(slides);

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
