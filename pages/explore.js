import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { MEMES } from '@/data/memes';
import ConnectWallet from '@/components/ConnectWallet';
import styles from './explore.module.css';

export default function Explore() {
  const router = useRouter();
  const { q } = router.query;

  const meme = useMemo(() => {
    if (!q) return MEMES[0];
    const found = MEMES.find(m => m.name.toLowerCase() === String(q).toLowerCase());
    return found || MEMES[0];
  }, [q]);

  if (!meme) return null;

  return (
    <div className={styles.root}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoAccent}>meme</span>
          <span className={styles.logoText}>taverse</span>
        </Link>
        <ConnectWallet />
      </nav>
      
      <main className={styles.main}>
        {/* Back Button */}
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft className={styles.backIcon} />
          Back to Map
        </Link>

        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {meme.name}:<br />The Internet Phenomenon
          </h1>

          <p className={styles.subtitle}>
            "{meme.desc} Learn about its origins, cultural impact, and why it became a global standard."
          </p>
        </div>

        {/* Hero Image / Graphic */}
        <div className={styles.heroBox}>
          <div className={styles.heroGrid}></div>
          <span className={styles.heroEmoji}>{meme.flag}</span>
        </div>

        {/* Article Layout */}
        <div className={styles.layout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <button className={styles.actionBtn}>
              <Share2 className={styles.actionIcon} />
            </button>
            <button className={styles.actionBtn}>
              <Bookmark className={styles.actionIcon} />
            </button>
          </div>

          {/* Main Content */}
          <article className={styles.content}>
            <p>
              {meme.name}, often recognized globally due to its viral spread, is a cultural artifact that emerged from {meme.country} in {meme.year}. It represents a unique moment in internet history where community adaptation and context collapse created a universally understood visual language.
            </p>

            <div>
              <h2 className={styles.heading}>
                Transmission and Context
              </h2>
              <p>
                Internet phenomena do not spread directly from person to person in a vacuum. Instead, they rely on a vector—often social media platforms, forums, or messaging apps—to complete their transmission cycle. When a user is exposed to the {meme.name} template, they internalize the visual language. After an incubation period of cultural processing, they adapt the format to transmit their own relatable experiences to others through subsequent posts.
              </p>
            </div>

            <div>
              <h2 className={styles.heading}>
                The Global Impact
              </h2>
              <p>
                Once confined to specific subcultures, {meme.name} has now spread worldwide, putting nearly half of the world's internet population at risk of exposure. The attention economy estimates that millions of digital interactions occur each year involving this format. The cultural footprint is staggering, altering everyday vernacular and digital communication. Beyond the numbers, the human cost is immeasurable, with severe cases leading to real-world merchandising and, in tragic instances, corporate adoption.
              </p>
            </div>

            {/* Key Takeaway Box */}
            <div className={styles.takeawayBox}>
              <h3 className={styles.takeawayTitle}>Key Takeaway</h3>
              <p className={styles.takeawayText}>
                Understanding the lifecycle of the digital artifact and the transmission of the format is the first step in digital literacy. Awareness drives action, and collective action is our best shield against misinformation.
              </p>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.footerLabel}>Written by</p>
              <p className={styles.footerName}>
                The Memetaverse Research Team
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
