import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { createPresentation } from '@/lib/googleSlides';

export async function POST(request) {
    try {
        const { slides, theme } = await request.json();

        // Check if Google Credentials are available
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
            try {
                console.log("Using Google Slides API for generation...");
                const { presentationId, driveService } = await createPresentation(slides.title, slides, theme);

                // Export to PPTX
                const exportResponse = await driveService.files.export({
                    fileId: presentationId,
                    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                }, { responseType: 'arraybuffer' });

                const buffer = Buffer.from(exportResponse.data);

                // Optional: Delete the temp file from Drive to avoid clutter? 
                // For now, let's keep it as a record or maybe we want to return the link later.
                // await driveService.files.delete({ fileId: presentationId });

                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'Content-Disposition': `attachment; filename="presentation.pptx"`,
                    },
                });

            } catch (googleError) {
                console.error("Google Slides API failed, falling back to local generation:", googleError);
                // Fall through to local generation
            }
        }

        console.log("Using local PptxGenJS for generation...");
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        // Define theme colors or defaults
        const colors = theme?.colors || {
            primary: '0F766E',
            secondary: '0F172A',
            accent: 'F59E0B',
            background: 'FFFFFF',
            text: '334155',
            slideBg: 'F8FAFC'
        };

        // Define theme fonts or defaults
        const headingFont = theme?.fonts?.heading.split(',')[0].replace(/['"]/g, '') || 'Arial';
        const bodyFont = theme?.fonts?.body.split(',')[0].replace(/['"]/g, '') || 'Arial';

        // Helper to strip # from hex codes for PptxGenJS
        const c = (hex) => hex.replace('#', '');

        // Set Master Slide with Theme Background
        pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: c(colors.slideBg) },
            objects: [
                { rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: c(colors.primary) } } }, // Top bar
                { rect: { x: 0, y: 7.35, w: '100%', h: 0.15, fill: { color: c(colors.secondary) } } } // Bottom bar
            ]
        });

        // Title Slide
        let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        slide.addText(slides.title, {
            x: 1, y: 2, w: '80%', h: 1.5,
            fontSize: 44, align: 'center', bold: true,
            color: c(colors.primary), fontFace: headingFont
        });
        slide.addText("TAFE Educator Content Generator", {
            x: 1, y: 3.8, w: '80%', h: 1,
            fontSize: 18, align: 'center',
            color: c(colors.text), fontFace: bodyFont
        });

        // Decorative accent line
        slide.addShape(pptx.ShapeType.rect, {
            x: 4.5, y: 3.6, w: 1, h: 0.05,
            fill: { color: c(colors.accent) }
        });

        // Content Slides
        slides.slides.forEach((s, i) => {
            slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

            // Slide Title
            slide.addText(s.title, {
                x: 0.5, y: 0.5, w: '90%', h: 0.8,
                fontSize: 28, bold: true,
                color: c(colors.primary), fontFace: headingFont,
                border: { pt: 0, pb: 0, color: c(colors.secondary) }
            });

            // Separator line
            slide.addShape(pptx.ShapeType.line, {
                x: 0.5, y: 1.3, w: '90%', h: 0,
                line: { color: c(colors.accent), width: 2 }
            });

            // Content Body
            if (s.content && Array.isArray(s.content)) {
                // Detailed Content Mode
                const contentText = s.content.map(p => ({
                    text: p,
                    options: {
                        fontSize: 16,
                        breakLine: true,
                        color: c(colors.text),
                        fontFace: bodyFont,
                        paraSpaceBefore: 10
                    }
                }));

                slide.addText(contentText, {
                    x: 0.5, y: 1.5, w: '60%', h: 5,
                    valign: 'top'
                });
            } else {
                // Outline Mode
                const bullets = s.points.map(p => ({
                    text: p,
                    options: {
                        fontSize: 18,
                        bullet: { type: 'bullet', color: c(colors.secondary) },
                        breakLine: true,
                        color: c(colors.text),
                        fontFace: bodyFont
                    }
                }));

                slide.addText(bullets, {
                    x: 0.5, y: 1.5, w: '60%', h: 5,
                    lineSpacing: 32, valign: 'top'
                });
            }

            // Speaker Notes
            if (s.speakerNotes) {
                slide.addNotes(s.speakerNotes);
            }

            // Infographic Placeholder
            if (s.infographic) {
                slide.addText("Visual Suggestion:", {
                    x: 6.8, y: 1.5, w: '30%', h: 0.5,
                    fontSize: 14, bold: true, color: c(colors.secondary), fontFace: bodyFont
                });
                slide.addText(s.infographic, {
                    x: 6.8, y: 2.0, w: '30%', h: 4,
                    fontSize: 12, color: c(colors.text),
                    shape: pptx.ShapeType.rect,
                    fill: { color: c(colors.background), transparency: 50 },
                    line: { color: c(colors.accent), width: 1, dashType: 'dash' },
                    fontFace: bodyFont, valign: 'top'
                });
            }
        });

        const buffer = await pptx.write({ outputType: 'nodebuffer' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="presentation.pptx"`,
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Failed to export presentation.' },
            { status: 500 }
        );
    }
}
