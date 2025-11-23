
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

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
            const templatePath = path.join(process.cwd(), 'Template_WB.docx');
            const examplePath = path.join(process.cwd(), 'UEEEIC0010_WB.docx');

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

        const prompt = `
      You are an expert TAFE curriculum developer.
      Create a comprehensive learner workbook for the unit: ${toc.title}.
      
      Structure the workbook exactly according to this Table of Contents:
      ${JSON.stringify(toc.chapters)}
      
      ### Style and Tone Guide
      Use the following text from an existing high - quality workbook as a reference for the required depth, tone, and formatting style:
      ${exampleText.substring(0, 3000)}...[truncated for length]

      ### Template Structure
      Ensure the output follows the structural elements found in this template:
      ${templateText.substring(0, 1000)}...[truncated for length]

      For each chapter, provide detailed, educational content suitable for TAFE students.
    Include:
    - Clear explanations of concepts
        - Practical examples relevant to the Australian industry
            - Activities or checkpoints for understanding
      
      Output JSON structure:
    {
        "workbook": {
            "title": "${toc.title}",
                "chapters": [
                    {
                        "title": "Chapter Title",
                        "content": "Full markdown content for the chapter..."
                    }
                ]
        }
    }
`;

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
