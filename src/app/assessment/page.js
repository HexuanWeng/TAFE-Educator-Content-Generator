"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function AssessmentPage() {
    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [thinkingStep, setThinkingStep] = useState("");
    const [downloadingAnswers, setDownloadingAnswers] = useState(false);
    const [downloadingStudent, setDownloadingStudent] = useState(false);

    const thinkingSteps = [
        "Analyzing unit competency standards...",
        "Designing multiple-choice questions...",
        "Formulating short answer scenarios...",
        "Creating marking guides and model answers...",
        "Reviewing assessment validity...",
        "Finalizing assessment document..."
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
            const res = await fetch('/api/generate-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [] }) // In real app, send file content
            });

            if (!res.ok) throw new Error("Generation failed");

            const data = await res.json();
            setAssessment(data);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container">
                <div className="header" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                    <h1>Generate Assessment</h1>
                </div>

                {!assessment ? (
                    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <form onSubmit={handleGenerate}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    Upload Workbook or Teaching Materials
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
                                        id="assessment-upload"
                                    />
                                    <label htmlFor="assessment-upload" className="btn" style={{ background: 'var(--input)', marginBottom: '1rem' }}>
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
                                ) : "Generate Assessment"}
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
                        <h2>{assessment.title}</h2>
                        <p style={{ marginBottom: '2rem', color: '#64748b' }}>
                            Generated {assessment.mcqs.length} MCQs and {assessment.shortAnswer.length} Short Answer Questions.
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3>Multiple Choice Preview</h3>
                            {assessment.mcqs.map((q, i) => (
                                <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--input)', borderRadius: 'var(--radius)' }}>
                                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{i + 1}. {q.question}</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                        {q.options.map((opt, j) => (
                                            <li key={j} style={{ color: opt === q.answer ? 'var(--primary)' : 'inherit' }}>
                                                {opt} {opt === q.answer && "(Correct)"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3>Short Answer Preview</h3>
                            {assessment.shortAnswer.map((q, i) => {
                                const questionText = typeof q === 'string' ? q : q.question;
                                const answerText = typeof q === 'string' ? "" : q.answer;

                                return (
                                    <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--input)', borderRadius: 'var(--radius)' }}>
                                        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{i + 1}. {questionText}</p>
                                        {answerText && (
                                            <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#e0f2fe', borderRadius: '4px', borderLeft: '4px solid #0284c7' }}>
                                                <strong>Model Answer:</strong> {answerText}
                                            </div>
                                        )}
                                        <textarea
                                            placeholder="Notes..."
                                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                                            rows={2}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ background: 'var(--input)' }}
                                onClick={() => setAssessment(null)}
                            >
                                Back
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--secondary)', color: 'white' }}
                                onClick={async () => {
                                    setDownloadingAnswers(true);
                                    try {
                                        const res = await fetch('/api/export-assessment', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ assessment, includeAnswers: true })
                                        });

                                        if (!res.ok) throw new Error("Export failed");

                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = "assessment_with_answers.docx";
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } catch (err) {
                                        alert("Error: " + err.message);
                                    } finally {
                                        setDownloadingAnswers(false);
                                    }
                                }}
                                disabled={downloadingAnswers || downloadingStudent}
                            >
                                {downloadingAnswers ? (
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
                                        Downloading...
                                    </span>
                                ) : "Download with Answers"}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    setDownloadingStudent(true);
                                    try {
                                        const res = await fetch('/api/export-assessment', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ assessment, includeAnswers: false })
                                        });

                                        if (!res.ok) throw new Error("Export failed");

                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = "assessment_student.docx";
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } catch (err) {
                                        alert("Error: " + err.message);
                                    } finally {
                                        setDownloadingStudent(false);
                                    }
                                }}
                                disabled={downloadingAnswers || downloadingStudent}
                            >
                                {downloadingStudent ? (
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
                                        Downloading...
                                    </span>
                                ) : "Download Student Version"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
