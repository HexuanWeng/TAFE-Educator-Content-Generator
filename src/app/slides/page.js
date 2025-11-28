"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

const thinkingSteps = [
    "Analyzing teaching materials...",
    "Identifying key learning objectives...",
    "Structuring slide content...",
    "Designing visual elements...",
    "Creating engaging transitions...",
    "Finalizing presentation...",
];

const finalThinkingSteps = [
    "Expanding slide content...",
    "Writing speaker notes...",
    "Refining language for TAFE students...",
    "Optimizing visual descriptions...",
    "Finalizing presentation structure...",
];

function SlideEditor({ slide, index, onUpdate, onDelete, onMoveUp, onMoveDown }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editedSlide, setEditedSlide] = useState(slide);

    // Update local state when prop changes
    useEffect(() => {
        setEditedSlide(slide);
    }, [slide]);

    const handleSave = (e) => {
        e.stopPropagation();
        onUpdate(editedSlide);
        setIsExpanded(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setEditedSlide(slide);
        setIsExpanded(false);
    };

    const addPoint = () => {
        setEditedSlide({
            ...editedSlide,
            points: [...editedSlide.points, "New point"]
        });
    };

    const updatePoint = (pointIndex, value) => {
        const newPoints = [...editedSlide.points];
        newPoints[pointIndex] = value;
        setEditedSlide({ ...editedSlide, points: newPoints });
    };

    const deletePoint = (pointIndex) => {
        const newPoints = editedSlide.points.filter((_, i) => i !== pointIndex);
        setEditedSlide({ ...editedSlide, points: newPoints });
    };

    return (
        <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--background)',
            overflow: 'hidden',
            marginBottom: '1rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isExpanded ? '#f8fafc' : 'transparent',
                cursor: 'pointer'
            }} onClick={() => !isExpanded && setIsExpanded(true)}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        Slide {index + 1}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{slide.title}</h4>
                    {!isExpanded && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                            {slide.points.length} points
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    {onMoveUp && (
                        <button
                            className="btn"
                            style={{ padding: '0.5rem', background: 'var(--input)', minWidth: 'auto' }}
                            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                            title="Move up"
                        >
                            ↑
                        </button>
                    )}
                    {onMoveDown && (
                        <button
                            className="btn"
                            style={{ padding: '0.5rem', background: 'var(--input)', minWidth: 'auto' }}
                            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                            title="Move down"
                        >
                            ↓
                        </button>
                    )}
                    <button
                        className="btn"
                        style={{ padding: '0.5rem', background: '#fee', color: '#c00', minWidth: 'auto' }}
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        title="Delete slide"
                    >
                        🗑
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Slide Title
                        </label>
                        <input
                            type="text"
                            value={editedSlide.title}
                            onChange={(e) => setEditedSlide({ ...editedSlide, title: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: '600' }}>Key Points</label>
                            <button
                                className="btn"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', background: 'var(--input)' }}
                                onClick={addPoint}
                            >
                                + Add Point
                            </button>
                        </div>
                        {editedSlide.points.map((point, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => updatePoint(i, e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                                <button
                                    className="btn"
                                    style={{ padding: '0.5rem', background: '#fee', color: '#c00', minWidth: 'auto' }}
                                    onClick={() => deletePoint(i)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Infographic Description
                        </label>
                        <textarea
                            value={editedSlide.infographic || ''}
                            onChange={(e) => setEditedSlide({ ...editedSlide, infographic: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.875rem',
                                minHeight: '60px',
                                resize: 'vertical'
                            }}
                            placeholder="Describe the visual element for this slide..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            className="btn"
                            style={{ background: 'var(--input)' }}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const themes = [
    {
        id: 'modern-clean',
        name: 'Modern Clean',
        colors: {
            primary: '#0F766E', // Deep Teal
            secondary: '#0F172A', // Slate 900
            accent: '#F59E0B', // Amber 500
            background: '#FFFFFF',
            text: '#334155', // Slate 700
            slideBg: '#F8FAFC' // Slate 50
        },
        fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' }
    },
    {
        id: 'professional-dark',
        name: 'Professional Dark',
        colors: {
            primary: '#38BDF8', // Sky 400
            secondary: '#1E293B', // Slate 800
            accent: '#818CF8', // Indigo 400
            background: '#0F172A', // Slate 900
            text: '#E2E8F0', // Slate 200
            slideBg: '#1E293B'
        },
        fonts: { heading: 'Poppins, sans-serif', body: 'Roboto, sans-serif' }
    },
    {
        id: 'corporate-minimal',
        name: 'Corporate Minimal',
        colors: {
            primary: '#2563EB', // Blue 600
            secondary: '#1F2937', // Gray 800
            accent: '#10B981', // Emerald 500
            background: '#FFFFFF',
            text: '#374151', // Gray 700
            slideBg: '#FFFFFF'
        },
        fonts: { heading: 'Arial, sans-serif', body: 'Arial, sans-serif' }
    },
    {
        id: 'australian-energy',
        name: 'Australian Energy',
        colors: {
            primary: '#158158', // Dark Green
            secondary: '#000000', // Black
            accent: '#058DC7', // Blue
            background: '#FFFFFF',
            text: '#334155',
            slideBg: '#FFFFFF'
        },
        fonts: { heading: 'Arial, sans-serif', body: 'Arial, sans-serif' }
    }
];

function ThemeSelector({ selectedTheme, onSelect }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {themes.map(theme => (
                <div
                    key={theme.id}
                    onClick={() => onSelect(theme)}
                    style={{
                        border: selectedTheme.id === theme.id ? `2px solid ${theme.colors.primary}` : '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '1rem',
                        cursor: 'pointer',
                        background: theme.colors.background,
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{
                        height: '100px',
                        background: theme.colors.slideBg,
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            color: theme.colors.primary,
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            marginBottom: '0.25rem'
                        }}>Title</div>
                        <div style={{
                            width: '60%',
                            height: '4px',
                            background: theme.colors.secondary,
                            borderRadius: '2px'
                        }}></div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>{theme.name}</div>
                </div>
            ))}
        </div>
    );
}

export default function SlidesPage() {
    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [slides, setSlides] = useState(null);
    const [thinkingStep, setThinkingStep] = useState("");
    const [view, setView] = useState('upload'); // 'upload', 'edit', 'theme'
    const [selectedTheme, setSelectedTheme] = useState(themes[0]);

    useEffect(() => {
        let interval;
        if (isLoading) {
            const steps = view === 'theme' ? finalThinkingSteps : thinkingSteps;
            let stepIndex = 0;
            setThinkingStep(steps[0]);
            interval = setInterval(() => {
                stepIndex = (stepIndex + 1) % steps.length;
                setThinkingStep(steps[stepIndex]);
            }, 3000);
        } else {
            setThinkingStep("");
        }
        return () => clearInterval(interval);
    }, [isLoading, view]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
            }

            const res = await fetch('/api/generate-slides', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Generation failed");
            }

            const data = await res.json();
            setSlides(data);
            setView('edit');
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const [finalSlides, setFinalSlides] = useState(null);
    const [designSpecs, setDesignSpecs] = useState(null);
    const [slideImages, setSlideImages] = useState(null);
    const [isDesigning, setIsDesigning] = useState(false);

    const handleDesignEnhance = async () => {
        setIsDesigning(true);
        try {
            // 1. Get Design Specs
            const resSpecs = await fetch('/api/enhance-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: finalSlides, currentTheme: selectedTheme })
            });

            if (!resSpecs.ok) throw new Error("Design enhancement failed");
            const specsData = await resSpecs.json();
            setDesignSpecs(specsData);

            // 2. Generate Images based on specs
            const resImages = await fetch('/api/generate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ designSpecs: specsData })
            });

            if (!resImages.ok) throw new Error("Image generation failed");
            const imagesData = await resImages.json();
            setSlideImages(imagesData.images);

        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsDesigning(false);
        }
    };

    const handleFinalGenerate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/generate-final-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides, theme: selectedTheme })
            });

            if (!res.ok) throw new Error("Final generation failed");

            const data = await res.json();
            setFinalSlides(data);
            setView('final_review');
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await fetch('/api/export-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slides: finalSlides || slides,
                    theme: designSpecs?.theme || selectedTheme,
                    design: designSpecs,
                    images: slideImages
                })
            });

            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "presentation.pptx";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDownloadTranscript = async () => {
        try {
            const res = await fetch('/api/export-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides: finalSlides })
            });

            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "transcript.docx";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container">
                <div className="header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <h1>Generate Slides</h1>
                </div>

                {view === 'upload' && (
                    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <form onSubmit={handleGenerate}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Upload Teaching Materials
                                </label>
                                <div style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '3rem',
                                    textAlign: 'center',
                                    background: 'var(--background)'
                                }}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles(e.target.files)}
                                        style={{ display: 'none' }}
                                        id="slides-upload"
                                    />
                                    <label htmlFor="slides-upload" className="btn" style={{ background: 'var(--input)', marginBottom: '1rem' }}>
                                        Choose Files
                                    </label>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {files ? `${files.length} files selected` : "Upload PDF, DOCX, or text files"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={isLoading || !files}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="spinner"></span>
                                        {thinkingStep}
                                    </span>
                                ) : "Generate Slide Outline"}
                            </button>
                        </form>
                    </div>
                )}

                {view === 'edit' && slides && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2>Edit Slide Deck</h2>
                                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                    {slides.slides.length} slides • Click any slide to edit
                                </p>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    const newSlide = {
                                        title: "New Slide",
                                        points: ["Point 1", "Point 2", "Point 3"],
                                        infographic: "Add infographic description"
                                    };
                                    setSlides({
                                        ...slides,
                                        slides: [...slides.slides, newSlide]
                                    });
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>+</span>
                                Add Slide
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {slides.slides.map((slide, i) => (
                                <SlideEditor
                                    key={i}
                                    slide={slide}
                                    index={i}
                                    onUpdate={(updatedSlide) => {
                                        const newSlides = [...slides.slides];
                                        newSlides[i] = updatedSlide;
                                        setSlides({ ...slides, slides: newSlides });
                                    }}
                                    onDelete={() => {
                                        const newSlides = slides.slides.filter((_, idx) => idx !== i);
                                        setSlides({ ...slides, slides: newSlides });
                                    }}
                                    onMoveUp={i > 0 ? () => {
                                        const newSlides = [...slides.slides];
                                        [newSlides[i - 1], newSlides[i]] = [newSlides[i], newSlides[i - 1]];
                                        setSlides({ ...slides, slides: newSlides });
                                    } : null}
                                    onMoveDown={i < slides.slides.length - 1 ? () => {
                                        const newSlides = [...slides.slides];
                                        [newSlides[i], newSlides[i + 1]] = [newSlides[i + 1], newSlides[i]];
                                        setSlides({ ...slides, slides: newSlides });
                                    } : null}
                                />
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setView('upload')}
                            >
                                Back to Upload
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setView('theme')}
                            >
                                Next: Select Theme
                            </button>
                        </div>
                    </div>
                )}

                {view === 'theme' && slides && (
                    <div className="card">
                        <div style={{ marginBottom: '2rem' }}>
                            <h2>Select Presentation Theme</h2>
                            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                Choose a visual style for your slides.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Preview</h3>
                                <div style={{
                                    aspectRatio: '16/9',
                                    background: selectedTheme.colors.slideBg,
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '3rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h1 style={{
                                        color: selectedTheme.colors.primary,
                                        fontFamily: selectedTheme.fonts.heading,
                                        fontSize: '2.5rem',
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        {slides.title || "Presentation Title"}
                                    </h1>
                                    <div style={{
                                        width: '100px',
                                        height: '6px',
                                        background: selectedTheme.colors.accent,
                                        marginBottom: '2rem'
                                    }}></div>
                                    <p style={{
                                        color: selectedTheme.colors.text,
                                        fontFamily: selectedTheme.fonts.body,
                                        fontSize: '1.25rem'
                                    }}>
                                        Generated by TAFE Content Generator
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Themes</h3>
                                <ThemeSelector
                                    selectedTheme={selectedTheme}
                                    onSelect={setSelectedTheme}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setView('edit')}
                            >
                                Back to Edit
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleFinalGenerate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="spinner"></span>
                                        {thinkingStep}
                                    </span>
                                ) : "Next: Generate Full Presentation"}
                            </button>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    .spinner {
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top-color: #fff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        display: inline-block;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>

                <style jsx>{`
                    .magic-btn {
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        color: white;
                        border: none;
                        transition: all 0.3s ease;
                    }
                    .magic-btn:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
                    }
                `}</style>

                {view === 'final_review' && finalSlides && (
                    <div className="card">
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h2>Final Presentation Review</h2>
                                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                    Review the detailed content before downloading.
                                </p>
                            </div>

                            {!designSpecs ? (
                                <button
                                    className="btn magic-btn"
                                    onClick={handleDesignEnhance}
                                    disabled={isDesigning}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                                >
                                    {isDesigning ? (
                                        <>
                                            <span className="spinner"></span>
                                            Designing...
                                        </>
                                    ) : (
                                        <>
                                            <span>✨</span>
                                            Magic Design with Nano Banana Pro
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    color: '#166534',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid #bbf7d0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '600'
                                }}>
                                    <span>✓</span>
                                    {designSpecs.designName || "Design Enhanced"}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
                            {finalSlides.slides.map((slide, i) => (
                                <div key={i} style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                    background: 'var(--background)'
                                }}>
                                    <div style={{
                                        padding: '1rem',
                                        background: '#f8fafc',
                                        borderBottom: '1px solid var(--border)',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>Slide {i + 1}: {slide.title}</span>
                                        {designSpecs && designSpecs.slideDesigns && designSpecs.slideDesigns[i] && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                background: '#f3e8ff',
                                                color: '#7e22ce',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '999px',
                                                border: '1px solid #d8b4fe'
                                            }}>
                                                Layout: {designSpecs.slideDesigns[i].layout}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Slide Content</h4>
                                            <ul style={{ paddingLeft: '1.5rem' }}>
                                                {slide.content.map((point, j) => (
                                                    <li key={j} style={{ marginBottom: '0.5rem' }}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Speaker Notes</h4>
                                            <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                                {slide.speakerNotes}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Visual Suggestion</h4>
                                            <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: '#0369a1' }}>
                                                {slide.infographic}
                                            </div>
                                            {designSpecs && designSpecs.slideDesigns && designSpecs.slideDesigns[i] && (
                                                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#fdf4ff', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: '#86198f', border: '1px dashed #d8b4fe' }}>
                                                    <strong>Nano Banana Pro Suggestion:</strong> {designSpecs.slideDesigns[i].visualNotes}
                                                </div>
                                            )}
                                            {slideImages && slideImages[i] && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    <img
                                                        src={slideImages[i]}
                                                        alt="Generated visual"
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: '300px',
                                                            objectFit: 'cover',
                                                            borderRadius: 'var(--radius)',
                                                            border: '1px solid var(--border)'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setView('theme')}
                            >
                                Back to Theme
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--secondary)', color: 'white' }}
                                onClick={handleDownloadTranscript}
                            >
                                Download Transcript (DOCX)
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleDownload}
                            >
                                Download Final PowerPoint
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main >
    );
}
