const cheerio = require('cheerio');

async function testSearch(query) {
    const url = `https://training.gov.au/Search?q=${encodeURIComponent(query)}`;
    console.log(`Searching: ${url}`);
    try {
        const res = await fetch(url, {
            redirect: 'follow', // Explicitly follow redirects
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log("Final URL:", res.url);

        const html = await res.text();
        // console.log("HTML Preview:", html.substring(0, 500));

        const $ = cheerio.load(html);

        // Check if we are already on a details page
        if (res.url.includes('/Training/Details/')) {
            console.log("Redirected to details page directly!");
            const title = $('h1').first().text().trim();
            console.log("Found:", { text: title, url: res.url });
            return;
        }

        const results = [];
        // Try to find ANY links
        $('a').each((i, el) => {
            const link = $(el).attr('href');
            if (link && link.includes('/Training/Details/')) {
                const text = $(el).text().trim();
                const fullUrl = `https://training.gov.au${link}`;
                results.push({ text, url: fullUrl });
            }
        });

        console.log("Found results:", results);

        // Debug: check if query exists in text
        if (html.includes(query)) {
            console.log(`Query "${query}" found in HTML.`);
        } else {
            console.log(`Query "${query}" NOT found in HTML.`);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testSearch("UEECD0014");

async function testDirectUrl(code) {
    const url = `https://training.gov.au/Training/Details/${code}`;
    console.log(`Checking: ${url}`);
    try {
        const res = await fetch(url, {
            method: 'HEAD', // Just check headers first
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log("Status:", res.status);
        if (res.ok) {
            console.log("Unit found!");
        } else {
            console.log("Unit not found.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testDirectUrl("UEECD0014");
