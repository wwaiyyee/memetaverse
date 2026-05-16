import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import ConnectWallet from '@/components/ConnectWallet';
import styles from './index.module.css';

const MemeGlobe = dynamic(() => import('@/components/MemeGlobe'), { ssr: false });

const MEME_FACTS = [
  { name: 'Doge',                   flag: '🐕', country: 'Japan',   year: '2013', desc: 'A Shiba Inu photo that spawned Dogecoin and defined broken-English internet absurdism.' },
  { name: 'Rickroll',               flag: '🎤', country: 'UK',      year: '2007', desc: 'Rick Astley\'s 1987 hit repurposed as the internet\'s most enduring bait-and-switch prank.' },
  { name: 'This Is Fine',           flag: '🔥', country: 'USA',     year: '2013', desc: 'KC Green\'s comic dog in a burning room — the definitive meme for catastrophic denial.' },
  { name: 'Nyan Cat',               flag: '🌈', country: 'Japan',   year: '2011', desc: 'A pixelated Pop-Tart cat trailing rainbows through space. Sold as NFT for $600k.' },
  { name: 'Coffin Dance',           flag: '💃', country: 'Ghana',   year: '2020', desc: 'Ghanaian pallbearers dancing joyfully — became the defining meme of early 2020.' },
  { name: 'Wojak',                  flag: '😢', country: 'Poland',  year: '2010', desc: 'A simple MS Paint face of existential sadness that spawned an entire internet taxonomy.' },
  { name: 'Drakeposting',           flag: '🎵', country: 'Canada',  year: '2015', desc: 'Screenshots from Drake\'s Hotline Bling video — the quintessential comparison format.' },
  { name: 'Surprised Pikachu',      flag: '⚡', country: 'Japan',   year: '2018', desc: 'Mock surprise at completely predictable outcomes. One frame from the Pokémon anime.' },
];

export default function Home() {
  const [activeMeme, setActiveMeme] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const handleMarkerClick = useCallback((meme) => {
    const facts = MEME_FACTS.find(f => f.name === meme.name);
    setActiveMeme({ ...meme, ...(facts || {}) });
    setHighlightId(meme.id);
  }, []);

  const handleClose = useCallback(() => {
    setActiveMeme(null);
    setHighlightId(null);
  }, []);

  return (
    <div className={styles.root}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo} style={{ alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '22px', color: '#002FA7', letterSpacing: '-0.5px' }}>meme</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '20px', color: '#1a1a2e', letterSpacing: '-0.3px' }}>taverse</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/explore"    className={styles.navPill}>explore</Link>
          <Link href="/contribute" className={styles.navPill}>contribute</Link>
          <Link href="/history"    className={styles.navPill}>history</Link>
        </div>

        <ConnectWallet />
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>

        {/* Globe — full bleed background */}
        <div className={styles.globeWrap}>
          <MemeGlobe
            onMarkerClick={handleMarkerClick}
            highlightId={highlightId}
          />
        </div>

        {/* Left — headline + CTA */}
        <div className={styles.leftPanel}>
          <div className={styles.tagline}>
            <span className={styles.taglineDot} />
            internet culture archive
          </div>

          <h1 className={styles.headline}>
            Where memes<br />
            <span className={styles.headlineAccent}>were born</span>
          </h1>

          <p className={styles.subline}>
            A living atlas of internet culture — trace every meme to its geographic
            origin, explore the stories behind the jokes, and contribute to the
            archive on&#8209;chain.
          </p>

          <div className={styles.heroActions}>
            <Link href="/explore" className={styles.btnPrimary}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              explore atlas
            </Link>
            <Link href="/contribute" className={styles.btnGhost}>
              contribute →
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>17</span>
              <span className={styles.statLabel}>memes mapped</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>12</span>
              <span className={styles.statLabel}>countries</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>∞</span>
              <span className={styles.statLabel}>lore</span>
            </div>
          </div>
        </div>

        {/* Right — ticker or meme card */}
        <div className={styles.rightPanel}>
          {activeMeme ? (
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
                {activeMeme.desc || 'Click a marker on the globe to explore this meme\'s origin and cultural significance.'}
              </p>
              <Link href={`/explore?q=${encodeURIComponent(activeMeme.name)}`} className={styles.memeLink}>
                full story
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          ) : (
            <div className={styles.ticker}>
              <div className={styles.tickerHeader}>
                <span className={styles.tickerLive} />
                recently mapped
              </div>
              <ul className={styles.tickerList}>
                {MEME_FACTS.map((m, i) => (
                  <li key={m.name} className={styles.tickerItem} style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className={styles.tickerDot} />
                    <span className={styles.tickerFlag}>{m.flag}</span>
                    <span className={styles.tickerName}>{m.name}</span>
                    <span className={styles.tickerCountry}>{m.country}</span>
                    <span className={styles.tickerYear}>{m.year}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.tickerHint}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                click any marker on the globe
              </div>
            </div>
          )}
        </div>

        {/* Chain badge */}
        <div className={styles.chainBadge}>
          <span className={styles.chainDot} />
          built on monad · contributions recorded on&#8209;chain
        </div>

        {/* Zoom hint */}
        <div className={styles.zoomHint}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
          scroll to zoom
        </div>

      </section>
    </div>
  );
}
