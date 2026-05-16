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

      <div className="flex items-center gap-2">
        <NavButton href="/explore">explore</NavButton>
        <NavButton href="/contribute">contribute</NavButton>
        <NavButton href="/history">history</NavButton>
      </div>

      <ConnectWallet />
    </nav>
  );
}

function NavButton({ href, children }) {
  return (
    <Link
      href={href}
      className="px-5 py-2 rounded-full border border-[#002FA7]/20 text-sm text-[#1a1a2e]/60 hover:text-[#002FA7] hover:border-[#002FA7]/45 hover:bg-[#002FA7]/5 transition-colors"
    >
      {children}
    </Link>
  );
}
