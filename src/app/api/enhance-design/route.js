import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { enhanceDesign } from '@/data/prompts';

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

    const prompt = enhanceDesign(slides, currentTheme);

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
