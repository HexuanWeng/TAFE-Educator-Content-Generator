import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ results: [] });
        }

        // Strategy: Direct Unit Code Lookup
        // We assume the user enters a code like "UEECD0014"
        const code = query.trim().toUpperCase();
        const url = `https://training.gov.au/Training/Details/${code}`;

        console.log(`Checking TGA for unit: ${code} at ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            // If 404 or other error, return empty results
            return NextResponse.json({ results: [] });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Verify it's actually a unit page by checking for specific elements
        // TGA unit pages usually have an H1 with the code and title
        let pageTitle = $('h1').first().text().trim();

        // Fallback: If TGA blocks scraping (Dynatrace/Bot protection), we might get a 200 OK but no content.
        // If the URL is valid, we assume it's the correct unit.
        if (!pageTitle && response.ok) {
            console.warn(`Warning: Could not extract title for ${code}. TGA might be blocking scraping. Using fallback.`);
            pageTitle = url;
        }

        if (pageTitle) {
            return NextResponse.json({
                results: [{
                    code: code,
                    title: pageTitle,
                    url: url
                }]
            });
        }

        return NextResponse.json({ results: [] });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to perform search.' },
            { status: 500 }
        );
    }
}
