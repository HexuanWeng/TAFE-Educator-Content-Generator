import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request) {
    try {
        const { slides } = await request.json();

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: slides.title || "Presentation Transcript",
                        heading: HeadingLevel.TITLE,
                        spacing: { after: 400 }
                    }),
                    ...slides.slides.flatMap((slide, index) => [
                        new Paragraph({
                            text: `Slide ${index + 1}: ${slide.title}`,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 400, after: 200 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Slide Content:",
                                    bold: true,
                                    break: 1
                                }),
                            ],
                            spacing: { after: 100 }
                        }),
                        ...(slide.content || slide.points || []).map(point =>
                            new Paragraph({
                                text: `• ${point}`,
                                spacing: { after: 50 },
                                indent: { left: 720, hanging: 360 }
                            })
                        ),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Speaker Notes:",
                                    bold: true,
                                    break: 1
                                }),
                            ],
                            spacing: { before: 200, after: 100 }
                        }),
                        new Paragraph({
                            text: slide.speakerNotes || "No notes available.",
                            spacing: { after: 200 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Visual Description:",
                                    bold: true,
                                    italics: true
                                }),
                                new TextRun({
                                    text: ` ${slide.infographic || "N/A"}`,
                                    italics: true
                                })
                            ],
                            spacing: { after: 400 }
                        })
                    ])
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="transcript.docx"`,
            },
        });

    } catch (error) {
        console.error('Transcript export error:', error);
        return NextResponse.json(
            { error: 'Failed to export transcript.' },
            { status: 500 }
        );
    }
}
