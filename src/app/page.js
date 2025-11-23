import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />

      <div className="container">
        <section className="hero">
          <h1>
            Empowering TAFE Educators with <br />
            <span className="text-gradient">Intelligent Content Generation</span>
          </h1>
          <p>
            Streamline your curriculum development. Generate compliant workbooks,
            assessments, and slides in minutes, not days.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/workbook" className="btn btn-primary">
              Start a Workbook
            </Link>
            <a href="#features" className="btn" style={{ background: 'var(--input)' }}>
              Learn More
            </a>
          </div>
        </section>

        <section id="features" className="grid-3" style={{ padding: '4rem 0' }}>
          <Link href="/workbook" className="card card-hover">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Generate Workbook</h2>
            <p style={{ color: '#64748b' }}>
              Enter a TAFE unit URL and upload resources to create a structured,
              compliant learner workbook with automated TOC.
            </p>
          </Link>

          <Link href="/assessment" className="card card-hover">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Generate Assessment</h2>
            <p style={{ color: '#64748b' }}>
              Upload a workbook to automatically generate mapped MCQs and
              short-answer questions with marking guides.
            </p>
          </Link>

          <Link href="/slides" className="card card-hover">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Generate Slides</h2>
            <p style={{ color: '#64748b' }}>
              Turn your teaching materials into a visual slide deck outline,
              ready for the classroom.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
