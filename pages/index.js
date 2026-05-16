import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import ConnectWallet from '@/components/ConnectWallet';
import { MEMES } from '@/data/memes';
import styles from './index.module.css';

const MemeGlobe   = dynamic(() => import('@/components/MemeGlobe'),   { ssr: false });
const MemeFlatMap = dynamic(() => import('@/components/MemeFlatMap'), { ssr: false });

export default function Home() {
  const [query, setQuery]         = useState('');
  const [activeMeme, setActiveMeme] = useState(null);

  const isSearching = query.trim().length > 0;

  // Filter memes by name or country
  const results = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return MEMES.filter(
      m => m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q)
    );
  }, [query, isSearching]);

  const highlightIds = useMemo(() =>
    activeMeme ? [activeMeme.id] : results.map(r => r.id),
    [activeMeme, results]
  );

  const handleGlobeClick = useCallback((meme) => {
    setActiveMeme(meme);
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    setActiveMeme(null);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setActiveMeme(null);
  }, []);

  return (
    <div className={styles.root}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} style={{ alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '22px', color: '#002FA7', letterSpacing: '-0.5px' }}>meme</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '20px', color: '#1a1a2e', letterSpacing: '-0.3px' }}>taverse</span>
        </Link>
        <ConnectWallet />
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>

        {/* Globe (hidden while searching) */}
        <div
          className={styles.globeWrap}
          style={{ opacity: isSearching ? 0 : 1, pointerEvents: isSearching ? 'none' : 'auto', transition: 'opacity 0.4s ease' }}
        >
          <MemeGlobe onMarkerClick={handleGlobeClick} highlightIds={highlightIds} />
        </div>

        {/* Flat ASCII map (shown while searching) */}
        {isSearching && (
          <div style={{ position: 'absolute', inset: 0, animation: 'fadeIn 0.35s ease both', zIndex: 2 }}>
            <MemeFlatMap results={results} />
          </div>
        )}

        {/* ── Search bar — always visible ── */}
        <div className={styles.searchPanel}>
          <div className={styles.searchInputWrap}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="search meme or country…"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveMeme(null); }}
              autoComplete="off"
              spellCheck={false}
            />
            {(query || activeMeme) && (
              <button className={styles.searchClear} onClick={handleClear} aria-label="clear">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* No results hint */}
          {isSearching && results.length === 0 && (
            <div className={styles.searchEmpty}>
              no memes found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Count badge */}
          {isSearching && results.length > 0 && (
            <div className={styles.searchCount}>
              <span className={styles.searchCountDot} />
              {results.length} {results.length === 1 ? 'meme' : 'memes'} found — click a pin on the map
            </div>
          )}
        </div>

        {/* ── Globe marker detail card ── */}
        {activeMeme && !isSearching && (
          <div className={styles.rightPanel}>
            <div className={styles.memeCard}>
              <div className={styles.memeCardTop} />
              <button className={styles.closeBtn} onClick={handleClose} aria-label="close">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              <div className={styles.memeIcon}>{activeMeme.flag}</div>
              <div className={styles.memeMeta}>
                <div className={styles.memeMetaLabel}>{activeMeme.country} · {activeMeme.year}</div>
                <h2 className={styles.memeName}>{activeMeme.name}</h2>
              </div>
              <p className={styles.memeDesc}>
                {activeMeme.desc || 'Click a marker to explore this meme\'s origin.'}
              </p>
              <Link href={`/explore?q=${encodeURIComponent(activeMeme.name)}`} className={styles.memeLink}>
                full story
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        )}

      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(0.94) translateY(4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
