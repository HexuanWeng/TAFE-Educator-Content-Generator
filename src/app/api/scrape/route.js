import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes('training.gov.au')) {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid training.gov.au URL.' },
                { status: 400 }
            );
        }

        // 1. Fetch the page content
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // 2. Extract text content to send to AI (remove scripts, styles to save tokens)
        $('script').remove();
        $('style').remove();
        const pageText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 30000); // Limit length for safety

        // 3. Use Gemini to analyze and structure the data
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback if no key (though we should have one now)
            console.warn("No GEMINI_API_KEY found, falling back to basic scrape");
            const titleText = $('h1').first().text().trim();
            return NextResponse.json({
                title: titleText || "Unknown Unit",
                url,
                chapters: [
                    "Unit Overview",
                    "Elements and Performance Criteria",
                    "Foundation Skills",
                    "Assessment Requirements"
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview", // Updated to Gemini 3.0
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
You are an expert TAFE curriculum designer and instructional content analyst.

Your task is to analyze the text extracted from a TAFE unit of competency page (${url}).

Extract and summarize the key learning structure.

### Objectives:
1. Identify the full **Unit Code and Title** from the page.
2. Generate a **logical Table of Contents (TOC)** suitable for a learner workbook.

### TOC Requirements:
- Include a **Unit Overview** section at the beginning.
- Derive **chapter titles** from "Elements and Performance Criteria".
- Include **Knowledge Evidence** topics as supporting theory sections.
- Include **Performance Evidence** tasks as applied/practical sections.
- Reflect clear learning flow: Overview → Elements/Criteria → Knowledge → Performance.

### Formatting Rules:
- Represent each chapter or section as a string in a list.
- Use a colon (:) to denote subsections, e.g. "Chapter: Subtopic".
- Keep chapter titles concise but meaningful.
- Ensure the TOC comprehensively reflects all key learning areas.

### Output JSON:
{
  "title": "UnitCode - UnitTitle",
  "chapters": [
    "Unit Overview",
    "Chapter 1: [Title or Outcome]",
    "Chapter 1: Performance Criteria",
    "Chapter 2: [Title or Outcome]",
    "Knowledge Evidence 1: [Topic]",
    "Performance Evidence 1: [Task]",
    "Summary"
  ]
}

### Notes:
- Maintain Australian English and WHS terminology.
- Avoid extra commentary — output only the JSON structure.
- If some information is missing, infer a logical placeholder based on the section structure.

Page Text:
${pageText}
`;


        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const data = JSON.parse(aiResponse.text());

        return NextResponse.json(data);

    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json(
            {
                error: 'Failed to scrape the URL.',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
