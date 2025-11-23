import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { files } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert TAFE educator and instructional designer.
Your task is to create a detailed slide deck outline for a TAFE unit presentation
based on the uploaded workbook content located at:
"/mnt/data/Template_WB.docx"

Follow the principles of the Australian Qualifications Framework (AQF)
and TAFE NSW teaching standards.

Each slide should capture real learning content — not just titles —
from the workbook, including theoretical explanations, examples, and definitions.

Include infographic ideas where visuals can enhance understanding
(e.g., diagrams, process charts, comparison tables, or Australian workplace examples).

---

Output Format (JSON):

{
  "title": "TAFE Unit Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "points": [
        "Key learning point 1 with context or explanation",
        "Key learning point 2 with context or example",
        "Key learning point 3 with context or application"
      ],
      "infographic": "Brief description of a suggested infographic to accompany the slide (e.g. energy flow diagram, WHS compliance process chart, Australian energy authority map)"
    }
  ]
}

---

Guidelines:
- Generate **15–20 slides**.
- Structure content in logical order, reflecting the workbook sections:
  1. Acknowledgment and Overview
  2. Introduction to the Australian Energy Industry
  3. Power Generation and Renewable Transition
  4. Key Authorities and Energy Pricing in Australia
  5. Energy Calculations and Efficiency
  6. Standards and Components (e.g., AS 3598.1)
  7. Writing an Energy Sector Report
  8. Summary and Reflection
- Use **Australian examples and context** throughout (e.g., NSW electricity market, renewable policy transitions).
- Ensure content is student-friendly, educational, and visually engaging.
- Include at least one infographic suggestion per 2–3 slides.

Return only the JSON structure described above.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const slides = JSON.parse(response.text());

    return NextResponse.json(slides);

  } catch (error) {
    console.error('Slide generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate slides.',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
