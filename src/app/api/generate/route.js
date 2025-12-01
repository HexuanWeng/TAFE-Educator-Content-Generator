
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';
import { generateWorkbook } from '@/data/prompts';

export async function POST(request) {
    try {
        const { toc, unitData } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
        }

        // Read and extract text from template files
        let templateText = "";
        let exampleText = "";

        try {
            const templatePath = path.join(process.cwd(), 'examples', 'Template_WB.docx');
            const examplePath = path.join(process.cwd(), 'examples', 'UEEEIC0010_WB.docx');

            const [templateBuffer, exampleBuffer] = await Promise.all([
                fs.readFile(templatePath).catch(() => null),
                fs.readFile(examplePath).catch(() => null)
            ]);

            if (templateBuffer) {
                const result = await mammoth.extractRawText({ buffer: templateBuffer });
                templateText = result.value;
            }

            if (exampleBuffer) {
                const result = await mammoth.extractRawText({ buffer: exampleBuffer });
                exampleText = result.value;
            }
        } catch (err) {
            console.warn("Could not read template files:", err);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = generateWorkbook(toc, exampleText, templateText);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const workbook = JSON.parse(response.text());

        return NextResponse.json(workbook);

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate workbook.',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
