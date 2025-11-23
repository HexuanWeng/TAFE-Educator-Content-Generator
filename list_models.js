const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function listModels() {
    try {
        // Read .env.local manually to avoid dependencies
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);

        if (!apiKeyMatch) {
            console.error("GEMINI_API_KEY not found in .env.local");
            return;
        }

        const apiKey = apiKeyMatch[1].trim();
        const genAI = new GoogleGenerativeAI(apiKey);

        // Note: listModels is on the GoogleGenerativeAI instance in some versions, 
        // or we might need to use the model manager if exposed. 
        // Actually, the SDK exposes it via the API. 
        // Let's try to use the direct API call if the SDK helper isn't obvious, 
        // but the SDK usually has `getGenerativeModel`. 
        // Wait, the SDK doesn't have a direct `listModels` on the client instance in v0.1. 
        // It seems we might need to use the REST API directly if the SDK doesn't expose it easily 
        // or check the SDK docs. 
        // Let's try a simple fetch to the API endpoint which is what the error suggested.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
