import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeAnalysis } from '@/data/prompts';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const url = formData.get('url');
        const files = formData.getAll('files');

        if (!url || !url.includes('training.gov.au')) {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid training.gov.au URL.' },
                { status: 400 }
            );
        }

        // 1. Fetch the page content from training.gov.au
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // 2. Extract text content from the web page
        $('script').remove();
        $('style').remove();
        let pageText = $('body').text().replace(/\s+/g, ' ').trim();

        // 3. Extract text from uploaded files (if any)
        let uploadedContent = '';
        if (files && files.length > 0) {
            console.log(`Processing ${files.length} uploaded file(s)...`);

            for (const file of files) {
                try {
                    const fileText = await file.text();
                    uploadedContent += `\n\n--- Content from ${file.name} ---\n${fileText}\n`;
                    console.log(`Extracted ${fileText.length} characters from ${file.name}`);
                } catch (err) {
                    console.error(`Error reading file ${file.name}:`, err);
                    // Continue with other files
                }
            }
        }

        // Combine page text and uploaded content, with limits
        const combinedText = (pageText + uploadedContent).substring(0, 50000); // Increased limit

        console.log(`Total content length: ${combinedText.length} characters`);
        console.log(`Uploaded files contributed: ${uploadedContent.length} characters`);

        // 4. Use Gemini to analyze and structure the data
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

        const prompt = scrapeAnalysis(url, combinedText);


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
