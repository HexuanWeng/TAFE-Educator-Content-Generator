import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function POST(request) {
    try {
        const { workbook } = await request.json();

        const children = [];

        // Title
        children.push(
            new Paragraph({
                text: workbook.title,
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 },
            })
        );

        // Chapters
        workbook.chapters.forEach(chapter => {
            children.push(
                new Paragraph({
                    text: chapter.title,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                })
            );

            // Split content by newlines and add as paragraphs
            const lines = chapter.content.split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    children.push(
                        new Paragraph({
                            children: [new TextRun(line.trim())],
                            spacing: { after: 100 },
                        })
                    );
                }
            });
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
                'Content-Disposition': `attachment; filename="workbook.docx"`,
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
