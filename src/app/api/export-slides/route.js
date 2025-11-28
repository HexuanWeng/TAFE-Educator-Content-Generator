import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import { createPresentation } from '@/lib/googleSlides';

export async function POST(request) {
    try {
        const { slides, theme, design, images } = await request.json();

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

        // Define theme colors or defaults (use design theme if available)
        const colors = (design?.theme || theme?.colors) || {
            primary: '0F766E',
            secondary: '0F172A',
            accent: 'F59E0B',
            background: 'FFFFFF',
            text: '334155',
            slideBg: 'F8FAFC'
        };

        // Define theme fonts or defaults
        const headingFont = (design?.theme?.fonts?.heading || theme?.fonts?.heading || 'Arial').split(',')[0].replace(/['"]/g, '');
        const bodyFont = (design?.theme?.fonts?.body || theme?.fonts?.body || 'Arial').split(',')[0].replace(/['"]/g, '');

        // Helper to strip # from hex codes for PptxGenJS
        const c = (hex) => hex ? hex.replace('#', '') : '000000';

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

            // Get layout from design specs if available
            const layout = design?.slideDesigns?.[i]?.layout || 'default';

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
            let contentX = 0.5;
            let contentW = '60%';
            let visualX = 6.8;
            let visualW = '30%';

            // Adjust layout based on Nano Banana Pro specs
            if (layout === 'split-right') {
                contentX = 0.5; contentW = '50%';
                visualX = 5.8; visualW = '40%';
            } else if (layout === 'split-left') {
                contentX = 5.0; contentW = '50%';
                visualX = 0.5; visualW = '40%';
            } else if (layout === 'centered-hero') {
                contentX = 1.5; contentW = '70%';
                visualX = 1.5; visualW = '70%'; // Visual below content
            }

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
                    x: contentX, y: 1.5, w: contentW, h: 5,
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
                    x: contentX, y: 1.5, w: contentW, h: 5,
                    lineSpacing: 32, valign: 'top'
                });
            }

            // Speaker Notes
            if (s.speakerNotes) {
                slide.addNotes(s.speakerNotes);
            }

            // Infographic Placeholder
            // Infographic / Image
            const visualY = layout === 'centered-hero' ? 5.0 : 1.5;
            const visualH = layout === 'centered-hero' ? 2.0 : 4.0;

            if (images && images[i]) {
                // Embed the generated image
                slide.addImage({
                    path: images[i],
                    x: visualX,
                    y: visualY,
                    w: visualW,
                    h: visualH,
                    sizing: { type: 'cover', w: visualW, h: visualH }
                });
            } else if (s.infographic) {
                // Fallback to text placeholder if no image
                slide.addText("Visual Suggestion:", {
                    x: visualX, y: visualY, w: visualW, h: 0.5,
                    fontSize: 14, bold: true, color: c(colors.secondary), fontFace: bodyFont
                });

                let visualText = s.infographic;
                if (design?.slideDesigns?.[i]?.visualNotes) {
                    visualText += `\n\n[Nano Banana Pro]: ${design.slideDesigns[i].visualNotes}`;
                }

                slide.addText(visualText, {
                    x: visualX, y: visualY + 0.5, w: visualW, h: visualH,
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

