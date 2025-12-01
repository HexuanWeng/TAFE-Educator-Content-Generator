
export const generateChapter = (unitCode, unitTitle, chapterTitle) => `
      You are an expert Australian TAFE curriculum developer and subject matter expert.
      Your task is to write the detailed content for ONE chapter of a learner workbook.

      **Unit Context:**
      Unit Code: ${unitCode || 'N/A'}
      Unit Title: ${unitTitle}

      **Chapter Title:**
      ${chapterTitle}

      **Requirements:**
      1.  **Deep Explanation**: Explain the concepts in this chapter thoroughly, suitable for a vocational learner. Avoid superficial summaries.
      2.  **Australian Context**: You MUST provide specific, relevant Australian industry examples. Mention Australian Standards (AS/NZS), regulations, or typical Australian workplace scenarios where applicable.
      3.  **Structure**: Use Markdown formatting.
          - Use ## for main section headings.
          - Use ### for sub-headings.
          - Use bullet points for readability.
      4.  **Tone**: Professional, educational, and encouraging.

      **Output:**
      Return ONLY the markdown content for this chapter. Do not include JSON wrapping.
    `;

export const generateAssessment = () => `
      You are an expert TAFE assessor.
      Generate a comprehensive assessment for a TAFE unit.

    Create:
    1. 25 Multiple Choice Questions(MCQs) with 4 options each and 1 correct answer.
      2. 30 Short Answer Questions with a model answer/marking guide for each.
      
      The questions should be suitable for a general Electrotechnology or Trade unit(as per the context of this app).
      
      Output JSON structure:
{
    "title": "Assessment Task",
        "mcqs": [
            { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" }
        ],
            "shortAnswer": [
                { "question": "Question 1...", "answer": "Model answer..." },
                { "question": "Question 2...", "answer": "Model answer..." }
            ]
}
`;

export const generateFinalSlides = (slides) => `
      You are an expert TAFE educational content developer.
      Your task is to take a slide outline and expand it into a professional, high-quality presentation.
      
      Input Slides:
      ${JSON.stringify(slides)}

      Instructions:
      1. For each slide, keep the original title.
      2. Expand the "points" into detailed, educational content. 
         - Instead of brief bullets, write comprehensive sentences or short paragraphs that explain the concept clearly.
         - Ensure the tone is professional, instructional, and suitable for adult learners (TAFE level).
      3. Add "speakerNotes" for each slide. These should be detailed scripts or cues for the presenter to explain the slide content.
      4. Refine the "infographic" description to be more specific and visually descriptive for a designer or AI image generator.

      Output JSON structure:
      {
        "title": "${slides.title}",
        "slides": [
          {
            "title": "Slide Title",
            "content": [
              "Detailed point 1...",
              "Detailed point 2..."
            ],
            "speakerNotes": "Script for the presenter...",
            "infographic": "Detailed visual description..."
          }
        ]
      }
    `;

export const generateImagePrompt = (visualNotes) => encodeURIComponent(
    `professional educational illustration, ${visualNotes}, modern style, high quality, 4k`
);

export const generateWorkbook = (toc, exampleText, templateText) => `
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

export const enhanceDesign = (slides, currentTheme) => `
      You are "Nano Banana Pro", a world-class presentation designer known for creating "fancy", high-impact, and visually stunning slide decks.
      
      Your task is to take an existing slide deck content and a base theme, and generate a "Design Enhancement Specification" that will transform it into a premium presentation.

      Input Slides:
      ${JSON.stringify(slides)}

      Current Base Theme:
      ${JSON.stringify(currentTheme)}

      Instructions:
      1. Analyze the content and the current theme.
      2. Create a refined "Advanced Theme" that improves upon the current colors and fonts. 
         - Suggest a more sophisticated color palette (hex codes).
         - Suggest premium font pairings (standard web fonts or Google Fonts).
      3. For EACH slide, suggest a specific "Layout" and "Visual Elements".
         - Layouts: "split-left", "split-right", "centered-hero", "grid-2-col", "grid-3-col", "quote-focus".
         - Visual Elements: Describe shapes, gradients, or decorative elements that should be added (e.g., "Add a subtle gradient overlay in the bottom right", "Use a semi-transparent circle behind the title").

      Output JSON structure:
      {
        "designName": "Nano Banana Pro - [Creative Name]",
        "theme": {
          "primary": "#HEX",
          "secondary": "#HEX",
          "accent": "#HEX",
          "background": "#HEX",
          "text": "#HEX",
          "slideBg": "#HEX",
          "fonts": { "heading": "Font Name", "body": "Font Name" }
        },
        "slideDesigns": [
          {
            "slideIndex": 0,
            "layout": "centered-hero",
            "visualNotes": "Description of visual enhancements..."
          }
          // ... one for each slide
        ]
      }
    `;

export const scrapeAnalysis = (url, pageText) => `
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
