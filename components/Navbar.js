import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
      <Link href="/" className="text-xl font-bold tracking-tight">
        <span className="text-white">meme</span>
        <span className="text-purple-400">sphere</span>
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
      className="px-5 py-2 rounded-full border border-white/20 text-sm text-white/80 hover:text-white hover:border-white/40 transition-colors"
    >
      {children}
    </Link>
  );
}
