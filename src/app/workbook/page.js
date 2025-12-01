"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

const thinkingSteps = [
    "Reading workbook templates...",
    "Analyzing unit requirements...",
    "Drafting content for Chapter 1...",
    "Structuring learning activities...",
    "Refining tone and style...",
    "Finalizing workbook..."
];

export default function WorkbookPage() {
    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null); // { code, title, url }
    const [scrapePreview, setScrapePreview] = useState(null); // Store scraping results to display

    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toc, setToc] = useState(null);
    const [thinkingStep, setThinkingStep] = useState("");

    // Effects
    useEffect(() => {
        let interval;
        if (isLoading && toc) {
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
    }, [isLoading, toc]);

    // Handlers
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults(null);
        setSelectedUnit(null); // Reset selection on new search

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });

            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();

            const results = data.results || [];
            setSearchResults(results);

            // Auto-select if exactly one result is found (Direct Match)
            if (results.length === 1) {
                selectUnit(results[0]);
            }

        } catch (err) {
            console.error("Search error:", err);
            alert("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const selectUnit = async (unit) => {
        setSelectedUnit(unit);
        setSearchResults(null); // Hide results after selection
        setSearchQuery(""); // Clear search bar

        // Immediately fetch scrape preview
        setScrapePreview(null); // Reset first
        setIsLoading(true);
        setThinkingStep("Fetching unit details from training.gov.au...");

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: unit.url })
            });

            if (res.ok) {
                const data = await res.json();
                setScrapePreview(data);
                
                if (data.fallback || data.warning) {
                    setThinkingStep("⚠️ Using default structure");
                } else {
                    setThinkingStep("✓ Unit details loaded");
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                setScrapePreview({ 
                    error: "Could not fetch unit details",
                    details: errorData.details || errorData.error,
                    suggestion: errorData.suggestion,
                    fallbackAvailable: errorData.fallbackAvailable
                });
            }
        } catch (err) {
            console.error("Scrape preview error:", err);
            setScrapePreview({ 
                error: "Network error occurred",
                details: err.message,
                suggestion: "Check your internet connection and try again."
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => setThinkingStep(""), 1500);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedUnit) return;

        setIsLoading(true);
        setThinkingStep("Analyzing unit structure from training.gov.au...");

        try {
            // Use FormData to send both URL and files
            const formData = new FormData();
            formData.append('url', selectedUnit.url);

            // Add uploaded files if any
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
                setThinkingStep("Analyzing uploaded resources...");
            }

            const res = await fetch('/api/scrape', {
                method: 'POST',
                body: formData  // Send as FormData instead of JSON
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to fetch unit data');
            }

            const data = await res.json();

            setThinkingStep(`✓ Found unit: ${data.title}`);

            // Brief delay to show the success message
            await new Promise(resolve => setTimeout(resolve, 1000));

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
            setThinkingStep("");
        }
    };

    // TOC Handlers
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

    const handleFinalExport = async () => {
        setIsLoading(true);
        try {
            const generatedChapters = [];

            for (let i = 0; i < toc.chapters.length; i++) {
                const chapterTitle = toc.chapters[i];
                setThinkingStep(`Agent working on Chapter ${i + 1}: ${chapterTitle}...`);

                const res = await fetch('/api/generate-chapter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chapterTitle,
                        unitTitle: toc.title,
                        unitCode: selectedUnit.code
                    })
                });

                if (!res.ok) throw new Error(`Failed to generate chapter: ${chapterTitle}`);

                const data = await res.json();
                generatedChapters.push({
                    title: chapterTitle,
                    content: data.content
                });
            }

            setThinkingStep("Compiling final workbook...");

            const fullWorkbook = {
                title: toc.title,
                chapters: generatedChapters
            };

            const exportRes = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workbook: fullWorkbook })
            });

            if (!exportRes.ok) throw new Error("Export failed");

            const blob = await exportRes.blob();
            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlObj;
            a.download = `${toc.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(urlObj);
            document.body.removeChild(a);

            alert("Workbook generated and downloaded!");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
            setThinkingStep("");
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '900px', paddingTop: '3rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
                        Create New Workbook
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
                        Search for a TAFE unit to automatically generate a comprehensive learner workbook.
                    </p>
                </div>

                {/* Search Section */}
                <div className="card card-hover" style={{ marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>✨</span>
                            <input
                                type="text"
                                placeholder="Enter Unit Code (e.g. UEECD0014)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--input)',
                                    color: 'var(--foreground)',
                                    fontSize: '1.1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSearching}
                            style={{ padding: '0 2.5rem', fontSize: '1.1rem' }}
                        >
                            {isSearching ? "..." : "Create"}
                        </button>
                    </form>

                    {/* Search Results Dropdown */}
                    {searchResults && searchResults.length > 0 && (
                        <div style={{
                            marginTop: '1rem',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '1rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Select a unit:</p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {searchResults.map((result, i) => (
                                    <li key={i}>
                                        <button
                                            onClick={() => selectUnit(result)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '1rem',
                                                background: 'var(--background)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <span style={{
                                                background: 'var(--primary)',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {result.code}
                                            </span>
                                            <span style={{ fontWeight: '500' }}>{result.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {searchResults && searchResults.length === 0 && (
                        <div style={{ marginTop: '1rem', color: '#ef4444', textAlign: 'center' }}>
                            No units found. Please check the code and try again.
                        </div>
                    )}
                </div>

                {/* Scrape Preview Section */}
                {scrapePreview && !toc && (
                    <div className="card" style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                                {scrapePreview.error ? '⚠️' : scrapePreview.warning ? '⚠️' : '📋'}
                            </span>
                            Unit Details from training.gov.au
                        </h3>

                        {scrapePreview.error ? (
                            <div style={{ padding: '1.5rem', background: '#fff3cd', borderRadius: 'var(--radius)', border: '1px solid #ffc107' }}>
                                <div style={{ fontWeight: '600', color: '#856404', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    ⚠️ {scrapePreview.error}
                                </div>
                                {scrapePreview.details && (
                                    <div style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                        <strong>Details:</strong> {scrapePreview.details}
                                    </div>
                                )}
                                {scrapePreview.suggestion && (
                                    <div style={{ 
                                        marginTop: '1rem', 
                                        padding: '0.75rem', 
                                        background: '#fff', 
                                        borderRadius: 'var(--radius)',
                                        borderLeft: '3px solid #ffc107'
                                    }}>
                                        <strong style={{ color: '#856404' }}>💡 Suggestion:</strong>
                                        <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>{scrapePreview.suggestion}</p>
                                    </div>
                                )}
                                {scrapePreview.fallbackAvailable && (
                                    <button 
                                        onClick={() => handleGenerate({ preventDefault: () => {} })}
                                        className="btn"
                                        style={{ marginTop: '1rem', background: 'var(--primary)', color: 'white' }}
                                    >
                                        Continue with Default Structure
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {scrapePreview.warning && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        background: '#fff3cd',
                                        borderRadius: 'var(--radius)',
                                        color: '#856404',
                                        fontSize: '0.875rem',
                                        marginBottom: '1rem',
                                        borderLeft: '3px solid #ffc107'
                                    }}>
                                        ⚠️ {scrapePreview.warning}
                                    </div>
                                )}
                                
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--input)',
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Unit Title:</p>
                                    <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{scrapePreview.title}</p>
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        Proposed Table of Contents ({scrapePreview.chapters?.length || 0} chapters):
                                    </p>
                                    <ul style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        {scrapePreview.chapters?.map((chapter, i) => (
                                            <li key={i} style={{
                                                padding: '0.5rem 1rem',
                                                background: i % 2 === 0 ? 'var(--background)' : 'transparent',
                                                borderRadius: 'var(--radius)',
                                                display: 'flex',
                                                gap: '0.75rem',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    color: 'var(--primary)',
                                                    fontWeight: 'bold',
                                                    minWidth: '2rem'
                                                }}>{i + 1}.</span>
                                                <span>{chapter}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: scrapePreview.fallback ? '#fff3cd' : '#e8f5e9',
                                    borderRadius: 'var(--radius)',
                                    color: scrapePreview.fallback ? '#856404' : '#2e7d32',
                                    fontSize: '0.875rem'
                                }}>
                                    {scrapePreview.fallback ? 
                                        '⚠️ Using default structure - You can customize chapters before generating' :
                                        '✓ Ready to customize and generate workbook'
                                    }
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Selected Unit & Configuration */}
                {selectedUnit && !toc && (
                    <div className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedUnit.title}</h2>
                                <span style={{
                                    color: 'var(--primary)',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                }}>
                                    {selectedUnit.code}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedUnit(null)}
                                style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Change Unit
                            </button>
                        </div>

                        <form onSubmit={handleGenerate}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                                    Upload Resources (Optional)
                                </label>
                                <div style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '3rem',
                                    textAlign: 'center',
                                    background: 'var(--background)',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles(e.target.files)}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</div>
                                        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Click to upload files</p>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {files ? `${files.length} files selected` : "PDFs, DOCX, or text files"}
                                        </p>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                                        <span className="spinner" style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            display: 'inline-block'
                                        }}></span>
                                        {thinkingStep || "Analyzing Unit Structure..."}
                                    </span>
                                ) : "Generate Workbook Structure"}
                            </button>
                            <style jsx>{`
                                @keyframes spin { to { transform: rotate(360deg); } }
                            `}</style>
                        </form>
                    </div>
                )}

                {/* TOC Review */}
                {toc && (
                    <div className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Review Workbook Structure</h2>
                            <button
                                onClick={() => setToc(null)}
                                className="btn"
                                style={{ background: 'var(--input)' }}
                            >
                                Back to Config
                            </button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                                {toc.chapters.map((chapter, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
                                            <button
                                                onClick={() => insertChapter(i)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--primary)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.5rem',
                                                    opacity: 0.5
                                                }}
                                                title="Insert Topic"
                                            >+</button>
                                        </div>

                                        <li style={{
                                            padding: '1rem',
                                            background: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <span style={{
                                                background: 'var(--primary)',
                                                color: 'white',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                fontWeight: 'bold',
                                                fontSize: '0.875rem',
                                                flexShrink: 0
                                            }}>{i + 1}</span>
                                            <input
                                                type="text"
                                                value={chapter}
                                                onChange={(e) => updateChapter(i, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    fontSize: '1rem',
                                                    fontWeight: '500',
                                                    color: 'var(--foreground)',
                                                    outline: 'none'
                                                }}
                                            />
                                            <button
                                                onClick={() => removeChapter(i)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    opacity: 0.7
                                                }}
                                                title="Remove"
                                            >×</button>
                                        </li>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                                    <button onClick={() => insertChapter(toc.chapters.length)} className="btn" style={{ background: 'var(--input)', fontSize: '0.875rem' }}>+ Add Topic</button>
                                </div>
                            </ul>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            onClick={handleFinalExport}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                                    <span className="spinner" style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '3px solid rgba(255,255,255,0.3)',
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
                            @keyframes spin { to { transform: rotate(360deg); } }
                            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                        `}</style>
                    </div>
                )}
            </div>
        </main>
    );
}
