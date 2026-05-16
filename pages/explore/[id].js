import { useRouter } from 'next/router';
import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { MEMES } from '@/data/memes';
import ConnectWallet from '@/components/ConnectWallet';
import { useReadContract } from 'wagmi';
import { MEME_REGISTRY_ADDRESS, MEME_REGISTRY_ABI } from '@/lib/contract';
import styles from '../explore.module.css';

export default function Explore() {
  const router = useRouter();
  const { id } = router.query;

  const isChainId = typeof id === 'string' && id.startsWith('chain-');
  const chainMemeId = isChainId ? id.replace('chain-', '') : null;

  const { data: chainMemeData, isLoading: isLoadingChainMeme } = useReadContract({
    address: MEME_REGISTRY_ADDRESS,
    abi: MEME_REGISTRY_ABI,
    functionName: 'getMeme',
    args: chainMemeId ? [chainMemeId] : undefined,
    query: {
      enabled: !!chainMemeId,
    }
  });

  const meme = useMemo(() => {
    if (!id) return null;
    
    if (isChainId && chainMemeData) {
      return {
        id: id,
        name: chainMemeData.title,
        desc: chainMemeData.description,
        country: chainMemeData.country,
        category: chainMemeData.category,
        year: chainMemeData.originDate,
        lat: Number(chainMemeData.latitude) / 10000,
        lon: Number(chainMemeData.longitude) / 10000,
        cid: chainMemeData.cid,
        image: chainMemeData.cid ? `https://teal-certain-salamander-344.mypinata.cloud/ipfs/${chainMemeData.cid}` : null,
        flag: '🌍',
        uploader: chainMemeData.uploader
      };
    } else if (!isChainId) {
      const found = MEMES.find(m => m.id.toString() === String(id));
      return found || MEMES[0];
    }
    return null;
  }, [id, isChainId, chainMemeData]);

  if (!meme && (!isChainId || isLoadingChainMeme)) return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoAccent}>meme</span><span className={styles.logoText}>taverse</span>
        </Link>
      </nav>
      <main className={styles.main} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Loading...</p>
      </main>
    </div>
  );

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
            {meme.name || meme.title}
          </h1>

          <p className={styles.subtitle}>
            {meme.desc || meme.description}
          </p>
        </div>

        {/* Hero Image / Graphic */}
        <div className={styles.heroBox} style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
          {meme.image ? (
            <object 
              data={meme.image} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              aria-label="Meme content"
            >
              <img src={meme.image} alt={meme.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </object>
          ) : (
            <span className={styles.heroEmoji}>{meme.flag || '📄'}</span>
          )}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {meme.country && (
                <p><strong>Country:</strong> {meme.country}</p>
              )}
              {(meme.year || meme.originDate) && (
                <p><strong>Origin Date / Year:</strong> {meme.year || meme.originDate}</p>
              )}
              {meme.category && (
                <p><strong>Category:</strong> {meme.category}</p>
              )}
              {(meme.lat !== undefined && meme.lon !== undefined) && (
                <p><strong>Coordinates:</strong> {meme.lat}, {meme.lon}</p>
              )}
              {meme.uploader && (
                <p><strong>Uploader (Wallet):</strong> <span style={{ fontFamily: 'monospace' }}>{meme.uploader}</span></p>
              )}
            </div>
            
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {meme.cid && (
                <a href={`https://gateway.pinata.cloud/ipfs/${meme.cid}`} target="_blank" rel="noopener noreferrer" style={{ color: "#ec4899", textDecoration: "underline" }}>
                  View Original File on IPFS
                </a>
              )}
              {meme.uploader && (
                <a href={`https://testnet.monadexplorer.com/address/${meme.uploader}`} target="_blank" rel="noopener noreferrer" style={{ color: "#ec4899", textDecoration: "underline" }}>
                  View Uploader on Monad Explorer
                </a>
              )}
              {isChainId && (
                <a href={`https://testnet.monadexplorer.com/address/${MEME_REGISTRY_ADDRESS}`} target="_blank" rel="noopener noreferrer" style={{ color: "#ec4899", textDecoration: "underline" }}>
                  View Smart Contract on Monad Explorer
                </a>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
