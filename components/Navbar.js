import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5">
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '22px', color: '#002FA7', letterSpacing: '-0.5px' }}>
          meme
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '20px', color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          taverse
        </span>
      </Link>

      <ConnectWallet />
    </nav>
  );
}

