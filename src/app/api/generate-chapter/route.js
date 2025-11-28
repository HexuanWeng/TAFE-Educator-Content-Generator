import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        const prompt = `
      You are an expert Australian TAFE curriculum developer and subject matter expert.
      Your task is to write the detailed content for ONE chapter of a learner workbook.

      **Unit Context:**
      Unit Code: ${unitCode || 'N/A'}
      Unit Title: ${unitTitle}

      **Chapter Title:**
      ${chapterTitle}

      **Requirements:**
      1.  **Deep Explanation**: Explain the concepts in this chapter thoroughly, suitable for a vocational learner. Avoid superficial summaries.
      2.  **Australian Context**: You MUST provide specific, relevant Australian industry examples. Mention Australian Standards (AS/NZS), regulations, or typical Australian workplace scenarios where applicable.
      3.  **Structure**: Use Markdown formatting.
          - Use ## for main section headings.
          - Use ### for sub-headings.
          - Use bullet points for readability.
      4.  **Tone**: Professional, educational, and encouraging.

      **Output:**
      Return ONLY the markdown content for this chapter. Do not include JSON wrapping.
    `;

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
