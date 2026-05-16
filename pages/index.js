import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import MemeDropZone from '@/components/MemeDropZone';
import MemeSearch from '@/components/MemeSearch';

// Canvas globe — no SSR (uses window/requestAnimationFrame)
const MemeGlobe = dynamic(() => import('@/components/MemeGlobe'), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-white flex flex-col">
      <Navbar />

      {/* Main content */}
      <div className="flex flex-1 items-center px-8 lg:px-16 gap-8">

        {/* Left — identify panel */}
        <div className="w-full max-w-sm shrink-0 flex flex-col gap-5 py-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/35 uppercase">
            identify a meme
          </p>

          <MemeDropZone />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/25">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <MemeSearch />
        </div>

        {/* Right — globe */}
        <div className="flex-1 flex items-center justify-center py-8">
          <MemeGlobe />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 lg:px-16 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
          <span>built on monad · contributions recorded on-chain</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <a
            href="/contribute"
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            contribute to the archive →
          </a>
        </div>
      </footer>
    </div>
  );
}
