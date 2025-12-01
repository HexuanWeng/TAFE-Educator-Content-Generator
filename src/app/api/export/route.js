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
        // Helper function to parse markdown text into TextRun objects
        const parseInlineFormatting = (text) => {
            const runs = [];
            let currentText = "";
            let isBold = false;
            let isItalic = false;
            
            // Simple parser for **bold** and *italic*
            // Note: This is a basic implementation. For production, a robust tokenizer is better.
            for (let i = 0; i < text.length; i++) {
                // Check for bold (** or __)
                if ((text[i] === '*' && text[i+1] === '*') || (text[i] === '_' && text[i+1] === '_')) {
                    if (currentText) {
                        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
                        currentText = "";
                    }
                    isBold = !isBold;
                    i++; // Skip next char
                    continue;
                }
                
                // Check for italic (* or _)
                // We need to be careful not to trigger on ** or __ which are handled above
                if ((text[i] === '*' || text[i] === '_') && 
                    (i === 0 || text[i-1] !== text[i]) && 
                    (i === text.length - 1 || text[i+1] !== text[i])) {
                    
                    if (currentText) {
                        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
                        currentText = "";
                    }
                    isItalic = !isItalic;
                    continue;
                }
                
                currentText += text[i];
            }
            
            if (currentText) {
                runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
            }
            
            return runs;
        };

        // Chapters
        workbook.chapters.forEach(chapter => {
            // Chapter Title
            children.push(
                new Paragraph({
                    text: chapter.title,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                })
            );

            // Parse Markdown Content
            const lines = chapter.content.split('\n');
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return; // Skip empty lines

                // Headings
                if (trimmedLine.startsWith('### ')) {
                    children.push(new Paragraph({
                        children: parseInlineFormatting(trimmedLine.substring(4)),
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 200, after: 100 }
                    }));
                } else if (trimmedLine.startsWith('## ')) {
                    children.push(new Paragraph({
                        children: parseInlineFormatting(trimmedLine.substring(3)),
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 150 }
                    }));
                } else if (trimmedLine.startsWith('# ')) {
                    children.push(new Paragraph({
                        children: parseInlineFormatting(trimmedLine.substring(2)),
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    }));
                }
                // Bullet Points
                else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    children.push(new Paragraph({
                        children: parseInlineFormatting(trimmedLine.substring(2)),
                        bullet: { level: 0 },
                        spacing: { after: 50 }
                    }));
                }
                // Numbered Lists (Basic support for "1. ")
                else if (/^\d+\.\s/.test(trimmedLine)) {
                     const content = trimmedLine.replace(/^\d+\.\s/, '');
                     children.push(new Paragraph({
                        children: parseInlineFormatting(content),
                        bullet: { level: 0 }, // docx doesn't have a simple "numbered" preset without config, using bullet for now or we could use numbering
                        // For simplicity in this quick implementation, we'll stick to bullets or just text. 
                        // Let's actually just render it as text but maybe indented? 
                        // Or actually, let's try to use a numbering instance if possible, but that requires Numbering config.
                        // Fallback: Treat as paragraph with text "1. Content"
                        children: parseInlineFormatting(trimmedLine),
                        spacing: { after: 100 }
                    }));
                }
                // Regular Paragraph
                else {
                    children.push(new Paragraph({
                        children: parseInlineFormatting(trimmedLine),
                        spacing: { after: 100 }
                    }));
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
