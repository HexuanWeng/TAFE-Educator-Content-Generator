import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAssessment } from '@/data/prompts';

export async function POST(request) {
    try {
        const { files } = await request.json();
        // Note: In a real implementation, we would read the file content.
        // Since we don't have file storage/parsing yet, we'll ask the AI to generate based on a generic prompt 
        // or the user would paste content. For now, we'll assume the user wants a general assessment 
        // or we use a placeholder context if files are empty.

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = generateAssessment();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const assessment = JSON.parse(response.text());

        return NextResponse.json(assessment);

    } catch (error) {
        console.error('Assessment generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate assessment.',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
