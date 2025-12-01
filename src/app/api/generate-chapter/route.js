import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateChapter } from '@/data/prompts';

export async function POST(request) {
    try {
        const { chapterTitle, unitTitle, unitCode } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            generationConfig: { responseMimeType: "text/plain" }
        });

        const prompt = generateChapter(unitCode, unitTitle, chapterTitle);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        return NextResponse.json({ content });

    } catch (error) {
        console.error('Chapter generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate chapter content.' },
            { status: 500 }
        );
    }
}
