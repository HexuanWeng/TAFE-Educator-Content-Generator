"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function WorkbookPage() {
    const [url, setUrl] = useState("");
    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toc, setToc] = useState(null);
    const [thinkingStep, setThinkingStep] = useState("");

    const thinkingSteps = [
        "Reading workbook templates...",
        "Analyzing unit requirements...",
        "Drafting content for Chapter 1...",
        "Structuring learning activities...",
        "Refining tone and style...",
        "Finalizing workbook..."
    ];

    useEffect(() => {
        let interval;
        if (isLoading && toc) { // Only show thinking steps during generation, not initial scraping
            let stepIndex = 0;
            setThinkingStep(thinkingSteps[0]);
            interval = setInterval(() => {
                stepIndex = (stepIndex + 1) % thinkingSteps.length;
                setThinkingStep(thinkingSteps[stepIndex]);
            }, 3000); // Change step every 3 seconds
        } else {
            setThinkingStep("");
        }
        return () => clearInterval(interval);
    }, [isLoading, toc]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to fetch unit data');
            }

            const data = await res.json();

            // Generate initial TOC based on scraped data
            setToc({
                title: data.title,
                chapters: data.chapters || [
                    "Unit Overview and Assessment Requirements",
                    "Topic 1: Industry Regulations and Standards",
                    "Topic 2: Planning and Preparation",
                    "Topic 3: Execution and Safety",
                    "Topic 4: Documentation and Reporting"
                ]
            });
        } catch (err) {
            console.error("Frontend Error:", err);
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateChapter = (index, value) => {
        const newChapters = [...toc.chapters];
        newChapters[index] = value;
        setToc({ ...toc, chapters: newChapters });
    };

    const addChapter = () => {
        setToc({ ...toc, chapters: [...toc.chapters, "New Topic"] });
    };

    const insertChapter = (index) => {
        const newChapters = [...toc.chapters];
        newChapters.splice(index, 0, "New Topic");
        setToc({ ...toc, chapters: newChapters });
    };

    const removeChapter = (index) => {
        const newChapters = toc.chapters.filter((_, i) => i !== index);
        setToc({ ...toc, chapters: newChapters });
    };
    return (
        <main>
            <Navbar />
            <div className="container">
                <div className="header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <h1>Generate Workbook</h1>
                </div>

                {!toc ? (
                    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    TAFE Unit URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://training.gov.au/Training/Details/UEECD0014"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--input)',
                                        color: 'var(--foreground)',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                    Enter the full URL from training.gov.au
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Upload Resources (Optional)
                                </label>
                                <div style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: 'var(--background)'
                                }}>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles(e.target.files)}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="btn" style={{ background: 'var(--input)', marginBottom: '1rem' }}>
                                        Choose Files
                                    </label>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {files ? `${files.length} files selected` : "Drag & drop or click to upload PDFs, DOCX, or text files"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={isLoading}
                            >
                                {isLoading ? "Analyzing Unit..." : "Generate Table of Contents"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="card">
                        <h2>Review Table of Contents</h2>
                        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
                            Based on {url} and your uploaded files.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{toc.title}</h3>
                            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                                {toc.chapters.map((chapter, i) => (
                                    <div key={i}>
                                        {/* Insert Button Before Item */}
                                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                                            <button
                                                onClick={() => insertChapter(i)}
                                                style={{
                                                    background: 'var(--input)',
                                                    border: '1px dashed var(--border)',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'var(--foreground)',
                                                    fontSize: '1.2rem',
                                                    lineHeight: '1'
                                                }}
                                                title="Insert Topic Here"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <li style={{
                                            padding: '1rem',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <span style={{
                                                background: 'var(--input)',
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}>{i + 1}</span>
                                            <input
                                                type="text"
                                                value={chapter}
                                                onChange={(e) => updateChapter(i, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeChapter(i)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem'
                                                }}
                                                title="Remove Chapter"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    </div>
                                ))}
                                {/* Insert Button After Last Item */}
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                                    <button
                                        onClick={() => insertChapter(toc.chapters.length)}
                                        style={{
                                            background: 'var(--input)',
                                            border: '1px dashed var(--border)',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--foreground)',
                                            fontSize: '1.2rem',
                                            lineHeight: '1'
                                        }}
                                        title="Add Topic at End"
                                    >
                                        +
                                    </button>
                                </div>
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setToc(null)}
                            >
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        // Generate Content
                                        const genRes = await fetch('/api/generate', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ toc, unitData: {} }) // Pass unitData if stored
                                        });
                                        const genData = await genRes.json();

                                        // Export to DOCX
                                        const exportRes = await fetch('/api/export', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ workbook: genData.workbook })
                                        });

                                        if (!exportRes.ok) throw new Error("Export failed");

                                        const blob = await exportRes.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${toc.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);

                                        alert("Workbook generated and downloaded!");
                                    } catch (err) {
                                        alert("Error: " + err.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
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
                                ) : "Confirm & Generate Workbook"}
                            </button>
                            <style jsx>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
