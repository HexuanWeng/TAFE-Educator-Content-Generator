const cheerio = require('cheerio');

async function debugTGA(code) {
    const url = `https://training.gov.au/Training/Details/${code}`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);

        console.log("Status:", response.status);

        if (!response.ok) {
            console.error("Response not OK");
            return;
        }

        const html = await response.text();
        console.log("HTML Length:", html.length);

        const $ = cheerio.load(html);
        const h1 = $('h1').first().text().trim();
        console.log("H1 Text:", h1);

        const title = $('title').text();
        console.log("Page Title:", title);

        // Dump first 500 chars of HTML to see if it's a block page
        console.log("HTML Preview:\n", html.substring(0, 500));

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

debugTGA("UEECD0014");
