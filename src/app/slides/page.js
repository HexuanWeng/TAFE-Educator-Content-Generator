"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function SlidesPage() {
    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [slides, setSlides] = useState(null);
    const [thinkingStep, setThinkingStep] = useState("");

    const thinkingSteps = [
        "Analyzing teaching materials...",
        "Identifying key learning objectives...",
        "Structuring slide content...",
        "Designing visual elements...",
        "Creating engaging transitions...",
        "Finalizing presentation...",
    ];

    useEffect(() => {
        let interval;
        if (isLoading) {
            let stepIndex = 0;
            setThinkingStep(thinkingSteps[0]);
            interval = setInterval(() => {
                stepIndex = (stepIndex + 1) % thinkingSteps.length;
                setThinkingStep(thinkingSteps[stepIndex]);
            }, 3000);
        } else {
            setThinkingStep("");
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [] }) // In real app, send file content
            });

            if (!res.ok) throw new Error("Generation failed");

            const data = await res.json();
            setSlides(data);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            // For PPTX, we might need to handle it differently if using pptxgenjs on client or server.
            // If server, we fetch blob.
            const res = await fetch('/api/export-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slides })
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

    return (
        <main>
            <Navbar />
            <div className="container">
                <div className="header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <h1>Generate Slides</h1>
                </div>

                {!slides ? (
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
                                        <span className="spinner" style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            display: 'inline-block'
                                        }}></span>
                                        {thinkingStep}
                                    </span>
                                ) : "Generate Slide Outline"}
                            </button>
                            <style jsx>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </form>
                    </div>
                ) : (
                    <div className="card">
                        <h2>Slide Outline Preview</h2>
                        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
                            Generated {slides.slides.length} slides based on your content.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {slides.slides.map((slide, i) => (
                                <div key={i} style={{
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--background)',
                                    aspectRatio: '16/9',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        Slide {i + 1}
                                    </div>
                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{slide.title}</h4>
                                    <ul style={{ fontSize: '0.75rem', paddingLeft: '1rem', color: '#64748b', flex: 1, overflow: 'hidden' }}>
                                        {slide.points.slice(0, 3).map((p, j) => (
                                            <li key={j}>{p}</li>
                                        ))}
                                        {slide.points.length > 3 && <li>...</li>}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setSlides(null)}
                            >
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleDownload}
                            >
                                Download PowerPoint (PPTX)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
