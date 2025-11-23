import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="header container">
            <Link href="/" className="logo">
                <span style={{ fontSize: '2rem' }}>🎓</span>
                <span className="text-gradient">TAFE Gen</span>
            </Link>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/workbook" className="btn">Workbook</Link>
                <Link href="/assessment" className="btn">Assessment</Link>
                <Link href="/slides" className="btn">Slides</Link>
            </div>
        </nav>
    );
}
