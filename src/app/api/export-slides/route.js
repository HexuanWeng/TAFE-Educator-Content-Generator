import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export async function POST(request) {
    try {
        const { slides } = await request.json();

        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        // Title Slide
        let slide = pptx.addSlide();
        slide.addText(slides.title, { x: 1, y: 1, w: '80%', h: 1, fontSize: 36, align: 'center', bold: true, color: '0F766E' });
        slide.addText("TAFE Educator Content Generator", { x: 1, y: 2.5, w: '80%', h: 1, fontSize: 18, align: 'center', color: '64748B' });

        // Content Slides
        slides.slides.forEach(s => {
            slide = pptx.addSlide();

            // Slide Title
            slide.addText(s.title, { x: 0.5, y: 0.5, w: '90%', h: 0.8, fontSize: 24, bold: true, color: '0F766E', border: { pt: 0, pb: '1', color: 'E2E8F0' } });

            // Bullet Points
            const bullets = s.points.map(p => ({ text: p, options: { fontSize: 18, bullet: true, breakLine: true } }));
            slide.addText(bullets, { x: 0.5, y: 1.5, w: '90%', h: 4, color: '1E293B', lineSpacing: 32 });
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
