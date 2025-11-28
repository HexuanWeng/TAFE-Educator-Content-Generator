import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { designSpecs } = await request.json();

        if (!designSpecs || !designSpecs.slideDesigns) {
            return NextResponse.json({ error: 'No design specifications provided.' }, { status: 400 });
        }

        // Generate image URLs for each slide based on the visual description
        const slideImages = designSpecs.slideDesigns.map(design => {
            if (!design.visualNotes) return null;

            // Clean up the prompt for better generation
            const prompt = encodeURIComponent(
                `professional educational illustration, ${design.visualNotes}, modern style, high quality, 4k`
            );

            // Use Pollinations.ai for free, instant AI image generation
            // Adding a random seed to ensure uniqueness if needed, though prompt variation is usually enough
            const seed = Math.floor(Math.random() * 1000);
            return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
        });

        return NextResponse.json({ images: slideImages });

    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate images.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
