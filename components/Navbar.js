import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-[40px] py-[20px] bg-white/90 backdrop-blur-md border-b border-black/5">
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

