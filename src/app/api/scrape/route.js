import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        const prompt = `
Role: You are a VET Instructional Designer and Content Developer.

Task: Create a detailed Learner Workbook Table of Contents (TOC) for the unit (${url}), based on the provided unit document.

Structure Requirements: Please structure the TOC exactly as follows, ensuring all content is derived from the Unit text:

1. Unit Overview
Include sections for Application/Scope and Assessment Requirements.

2. Module 1: Preparation and Planning
Map this directly to Element 1.
Create sub-sections (1.1, 1.2, etc.) based on Performance Criteria 1.1 to 1.5.
Note: Ensure you include specific topics mentioned in the text, such as WHS processes, Project Planning Techniques, and Budgeting.

3. Module 2: Developing the Design Proposal
Map this directly to Element 2.
Create sub-sections based on Performance Criteria 2.1 to 2.5.
Note: Include topics such as Industry Standards, Collaboration, Role Identification, and rectifying anomalies.

4. Module 3: Negotiation and Approval
Map this directly to Element 3.
Create sub-sections based on Performance Criteria 3.1 to 3.3.
Note: Include Presentation, Negotiation of alterations, and Final Approval.

5. Knowledge Evidence (Theory Section)
Create sub-sections based on the Knowledge Evidence list (e.g., Critical Path Analysis, Customer Relations, Legislation).
6. Performance Evidence (Assessment Section)
Create sub-sections for Practical Tasks.
Constraint: The "Performance Evidence" states competence must be demonstrated on "at least two separate occasions". Create "Practical Task 1" and "Practical Task 2" to reflect this.
Include a section for Risk Control and Problem Solving logs as mentioned in the evidence requirements.
Formatting: Use a clean, numbered list format.

### Examole:
Workbook Table of Contents

Unit: UEECD0014 Develop design briefs for electrotechnology projects 

1. Unit Overview & Introduction
1.1 Unit Application and Scope 
1.2 Assessment Requirements Summary
2. Module 1: Preparation and Planning (Element 1)
2.1 Identifying WHS/OHS Processes and Procedures 
2.2 Project Planning Techniques and Critical Path Analysis 
2.3 Evaluating Projects and Surveying Parameters 
2.4 Consultation and Site Visits 
2.5 Determining Project Budgets and Deliverables 
3. Module 2: Developing the Design Proposal (Element 2)
3.1 Drafting the Brief: Scenarios and Industry Standards 
3.2 Collaborating with Professionals and Contractors 
3.3 Identifying Roles and Responsibilities 
3.4 Reviewing Inputs and Rectifying Anomalies 
3.5 Documenting the Proposal 
4. Module 3: Negotiation and Approval (Element 3)
4.1 Presenting the Brief to Stakeholders 
4.2 Negotiating Alterations and Customer Relations 
4.3 Final Documentation and Approval 
5. Knowledge Evidence Section (Theory Review)
5.1 Industry Standards & Manufacturer Specifications 
5.2 Legislation and Regulatory Requirements 
6. Performance Evidence Section (Practical Assessment)
6.1 Practical Task 1: Residential Project Brief (Occasion 1) 
6.2 Practical Task 2: Commercial/Industrial Project Brief (Occasion 2) 
6.3 Risk Control and Problem Solving Log

### Example Output JSON:
{
  "title": "UEECD0014 - Develop design briefs for electrotechnology projects",
  "chapters": [
    "1. Unit Overview & Introduction",
    "2. Module 1: Prepare to Develop Project Design Briefs (Element 1)",
    "3. Module 2: Develop Design Proposal (Element 2)",
    "4. Module 3: Obtain Approval for Project Design Briefs (Element 3)",
    "5. Knowledge Evidence: Critical Path Analysis & Project Planning",
    "6. Knowledge Evidence: Industry Standards, WHS & Budgeting",
    "7. Performance Evidence: Practical Task A (Occasion 1 - Residential/Small Scale)",
    "8. Performance Evidence: Practical Task B (Occasion 2 - Commercial/Complex Scale)",
    "9. Assessment Checklist: Risk Control & Problem Solving Logs"
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
