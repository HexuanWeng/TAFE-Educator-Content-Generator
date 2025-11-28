import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request) {
    try {
        const { assessment, includeAnswers } = await request.json();

        const children = [];

        // Title
        children.push(
            new Paragraph({
                text: assessment.title + (includeAnswers ? " (Assessor Guide)" : ""),
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 },
            })
        );

        // MCQs
        children.push(
            new Paragraph({
                text: "Part A: Multiple Choice Questions",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );

        assessment.mcqs.forEach((q, i) => {
            children.push(
                new Paragraph({
                    text: `${i + 1}. ${q.question}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 100 },
                })
            );
            q.options.forEach(opt => {
                const isCorrect = includeAnswers && opt === q.answer;
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `[${isCorrect ? 'X' : ' '}] ${opt}`,
                                bold: isCorrect,
                                color: isCorrect ? "008000" : "000000"
                            })
                        ],
                        spacing: { after: 50 },
                        indent: { left: 720 } // Indent options
                    })
                );
            });
        });

        // Short Answer
        children.push(
            new Paragraph({
                text: "Part B: Short Answer Questions",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );

        assessment.shortAnswer.forEach((q, i) => {
            // Handle both string (old format) and object (new format) for backward compatibility
            const questionText = typeof q === 'string' ? q : q.question;
            const answerText = typeof q === 'string' ? "" : q.answer;
            const notesText = q.notes || "";

            children.push(
                new Paragraph({
                    text: `${i + 1}. ${questionText}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 100 },
                })
            );

            if (includeAnswers) {
                if (answerText) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Model Answer: ",
                                    bold: true,
                                    color: "00008B"
                                }),
                                new TextRun({
                                    text: answerText,
                                    color: "00008B"
                                })
                            ],
                            spacing: { after: 200 },
                            indent: { left: 720 }
                        })
                    );
                }

                if (notesText) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Notes: ",
                                    bold: true,
                                    color: "555555"
                                }),
                                new TextRun({
                                    text: notesText,
                                    italics: true,
                                    color: "555555"
                                })
                            ],
                            spacing: { after: 400 },
                            indent: { left: 720 }
                        })
                    );
                } else {
                    // Just some spacing if no notes
                    children.push(new Paragraph({ spacing: { after: 400 } }));
                }

            } else {
                // Add space for answer if not assessor guide
                children.push(
                    new Paragraph({
                        text: "",
                        spacing: { after: 800 }, // Space for writing
                    })
                );
            }
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="assessment.docx"`,
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Failed to export document.' },
            { status: 500 }
        );
    }
}
