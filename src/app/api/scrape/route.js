import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeAnalysis } from '@/data/prompts';

export async function POST(request) {
    try {
        // Handle both JSON and FormData requests
        let url, files = [];
        const contentType = request.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const body = await request.json();
            url = body.url;
        } else {
            const formData = await request.formData();
            url = formData.get('url');
            files = formData.getAll('files');
        }

        if (!url || !url.includes('training.gov.au')) {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid training.gov.au URL.' },
                { status: 400 }
            );
        }

        console.log(`Attempting to scrape: ${url}`);

        // 1. Fetch the page content from training.gov.au with timeout and retry
        let response;
        let retries = 3;
        let lastError;
        
        for (let i = 0; i < retries; i++) {
            try {
                response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                break; // Success, exit retry loop
            } catch (err) {
                lastError = err;
                console.warn(`Fetch attempt ${i + 1} failed:`, err.message);
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
                }
            }
        }
        
        if (!response || !response.ok) {
            console.error('Failed to fetch after retries:', lastError);
            // Return fallback structure
            return NextResponse.json({
                title: "Unit from training.gov.au",
                url,
                chapters: [
                    "Unit Overview",
                    "Elements and Performance Criteria",
                    "Foundation Skills",
                    "Assessment Requirements"
                ],
                fallback: true,
                warning: "Could not fetch live data from training.gov.au. Using default structure."
            });
        }

        const html = await response.text();
        
        // Check if we got actual content
        if (!html || html.length < 100) {
            throw new Error('Invalid or empty response from training.gov.au');
        }
        
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

        // Check if we have enough content to analyze
        if (combinedText.length < 200 && uploadedContent.length === 0) {
            console.warn('Insufficient content extracted from page');
            const titleText = $('h1').first().text().trim();
            return NextResponse.json({
                title: titleText || "Unit from training.gov.au",
                url,
                chapters: [
                    "Unit Overview",
                    "Elements and Performance Criteria",
                    "Foundation Skills",
                    "Assessment Requirements"
                ],
                fallback: true,
                warning: "Limited content extracted. Using default structure."
            });
        }

        // 4. Use Gemini to analyze and structure the data
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback if no key
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
                ],
                fallback: true,
                warning: "API key not configured. Using default structure."
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview", // Updated to Gemini 3.0
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = scrapeAnalysis(url, combinedText);

        try {
            const result = await model.generateContent(prompt);
            const aiResponse = await result.response;
            const responseText = aiResponse.text();
            
            // Validate JSON response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
                console.error('Response text:', responseText.substring(0, 500));
                throw new Error('AI returned invalid JSON format');
            }
            
            // Ensure required fields exist
            if (!data.title) {
                data.title = "Unit from training.gov.au";
            }
            if (!data.chapters || !Array.isArray(data.chapters) || data.chapters.length === 0) {
                data.chapters = [
                    "Unit Overview",
                    "Elements and Performance Criteria",
                    "Foundation Skills",
                    "Assessment Requirements"
                ];
                data.fallback = true;
                data.warning = "AI could not extract chapter structure. Using default.";
            }

            console.log(`✅ Successfully scraped: ${data.title} with ${data.chapters.length} chapters`);
            return NextResponse.json(data);
            
        } catch (aiError) {
            console.error('AI processing error:', aiError);
            // Fallback to basic extraction
            const titleText = $('h1').first().text().trim();
            return NextResponse.json({
                title: titleText || "Unit from training.gov.au",
                url,
                chapters: [
                    "Unit Overview",
                    "Elements and Performance Criteria",
                    "Foundation Skills",
                    "Assessment Requirements"
                ],
                fallback: true,
                warning: `AI analysis failed: ${aiError.message}. Using default structure.`
            });
        }

    } catch (error) {
        console.error('Fatal scrape error:', error);
        
        // Extract URL from error context if available
        let errorUrl = 'unknown';
        try {
            const body = await request.clone().json().catch(() => ({}));
            errorUrl = body.url || errorUrl;
        } catch {}
        
        return NextResponse.json(
            {
                error: 'Failed to scrape the URL.',
                details: error.message,
                url: errorUrl,
                suggestion: 'Try uploading reference files instead, or check if the URL is accessible.',
                fallbackAvailable: true
            },
            { status: 500 }
        );
    }
}
