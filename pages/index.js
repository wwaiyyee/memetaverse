import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useCallback, useMemo, useEffect } from 'react';
import ConnectWallet from '@/components/ConnectWallet';
import { MEMES } from '@/data/memes';
import { FileUploadCard } from '@/components/FileUploadCard';
import styles from './index.module.css';
import { ethers } from 'ethers';
import { MEME_REGISTRY_ADDRESS, MEME_REGISTRY_ABI } from '@/lib/contract';
import { useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi } from 'viem';

const MemeGlobe = dynamic(() => import('@/components/MemeGlobe'), { ssr: false });

export default function Home() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [query, setQuery]         = useState('');
  const [activeMeme, setActiveMeme] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [onChainMemes, setOnChainMemes] = useState([]);

  const isSearching = query.trim().length > 0;

  // Combine static and on-chain memes, prioritizing on-chain so they show in trending
  const allMemes = useMemo(() => {
    return [...onChainMemes.reverse(), ...MEMES];
  }, [onChainMemes]);

  // Filter memes by name or country
  const results = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    return allMemes.filter(
      m => m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q)
    );
  }, [query, isSearching, allMemes]);

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

  // ── Real upload handlers ──
  const handleFilesChange = useCallback((newFiles, newEntries, entryId, progress, status) => {
    // Case 1: Progress update for an existing file entry
    if (entryId != null) {
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === entryId
            ? { ...f, progress: progress ?? f.progress, status: status ?? f.status }
            : f
        )
      );
      return;
    }

    // Case 2: Adding new file entries
    if (newEntries && newEntries.length > 0) {
      setUploadFiles(prev => [...prev, ...newEntries]);
    }
  }, []);

  const handleFileRemove = useCallback((id) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleUploadComplete = useCallback(async (result) => {
    // Update the file entry with the CID from Pinata
    setUploadFiles(prev =>
      prev.map(f =>
        f.id === result.fileEntryId
          ? { ...f, cid: result.cid, status: 'completed', progress: 100 }
          : f
      )
    );
    console.log('Uploaded to IPFS:', result.cid);

    // Write to smart contract
    try {
      const latInt = Math.round(parseFloat(result.latitude || 0) * 10000);
      const lngInt = Math.round(parseFloat(result.longitude || 0) * 10000);

      console.log("Sending transaction to Monad Testnet...");
      const hash = await writeContractAsync({
        address: MEME_REGISTRY_ADDRESS,
        abi: parseAbi([
          'function createMeme(string _title, string _cid, string _description, string _country, string _category, string _originDate, int256 _latitude, int256 _longitude) external returns (uint256)'
        ]),
        functionName: 'createMeme',
        args: [
          result.title || "Untitled",
          result.cid,
          result.description || "",
          result.country || "Unknown",
          result.category || "Other",
          result.originDate || new Date().getFullYear().toString(),
          latInt,
          lngInt
        ],
      });

      console.log("Transaction sent! Hash:", hash);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      console.log("Transaction confirmed on Monad!");
      
      // Refresh on-chain memes
      fetchOnChainMemes();
    } catch (err) {
      console.error("Error writing to smart contract:", err);
      alert("Failed to save meme on-chain: " + (err.message || err));
    }
  }, [writeContractAsync, publicClient]);

  const fetchOnChainMemes = async () => {
    try {
      // ALWAYS use a fixed RPC provider for reading data so the map works
      // regardless of what network the user's MetaMask is currently connected to.
      const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://monad-testnet.g.alchemy.com/v2/EuLqamhK_5ymLb8952SSc";
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const contract = new ethers.Contract(MEME_REGISTRY_ADDRESS, MEME_REGISTRY_ABI, provider);
      const data = await contract.getAllMemes();
      
      const formattedMemes = data.map(m => ({
        id: "chain-" + m.id.toString(),
        name: m.title,
        flag: '🌍', // default flag for on-chain
        lat: Number(m.latitude) / 10000,
        lon: Number(m.longitude) / 10000,
        country: m.country,
        year: m.originDate,
        desc: m.description,
        cid: m.cid,
        image: `https://teal-certain-salamander-344.mypinata.cloud/ipfs/${m.cid}`,
        uploader: m.uploader,
        category: m.category
      }));

      setOnChainMemes(formattedMemes);
      console.log("Fetched on-chain memes:", formattedMemes.length);
    } catch (err) {
      console.error("Error fetching on-chain memes:", err);
    }
  };

  useEffect(() => {
    fetchOnChainMemes();
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

        {/* Globe (always visible) */}
        <div className={styles.globeWrap}>
          <MemeGlobe onMarkerClick={handleGlobeClick} highlightIds={highlightIds} allMemes={allMemes} />
        </div>

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

          {/* Upload card */}
          <div className="mt-4">
            <FileUploadCard
              files={uploadFiles}
              onFilesChange={handleFilesChange}
              onFileRemove={handleFileRemove}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </div>

        {/* ── Globe marker detail card ── */}
        {/* ── Right Panel (Detail Card or Trending) ── */}
        {!isSearching && (
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
                  {activeMeme.desc || 'Click a marker to explore this meme\'s origin.'}
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
                  <div className={styles.tickerLive} />
                  trending atlas
                </div>
                <ul className={styles.tickerList}>
                  {allMemes.slice(0, 5).map((meme, idx) => (
                    <li
                      key={meme.id}
                      className={styles.tickerItem}
                      style={{ animationDelay: `${idx * 0.05}s`, cursor: 'pointer' }}
                      onClick={() => handleGlobeClick(meme)}
                    >
                      <div className={styles.tickerDot} />
                      <div className={styles.tickerFlag}>{meme.flag}</div>
                      <div className={styles.tickerName}>{meme.name}</div>
                      <div className={styles.tickerCountry}>{meme.country}</div>
                      <div className={styles.tickerYear}>{meme.year}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
