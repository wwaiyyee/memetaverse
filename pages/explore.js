import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { MEMES } from '@/data/memes';
import ConnectWallet from '@/components/ConnectWallet';
import styles from './explore.module.css';
import { ethers } from 'ethers';

export default function Explore() {
  const router = useRouter();
  const { id } = router.query;

  const [meme, setMeme] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchMeme = async () => {
      try {
        if (String(id).startsWith('chain-')) {
          const numericId = id.replace('chain-', '');
          const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://monad-testnet.g.alchemy.com/v2/EuLqamhK_5ymLb8952SSc";
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const contractAddress = process.env.NEXT_PUBLIC_MEME_REGISTRY_ADDRESS;
          const abi = ["function getMeme(uint256 _id) external view returns (tuple(uint256 id, string title, string cid, string description, string country, string category, string originDate, int256 latitude, int256 longitude, address uploader, uint256 createdAt))"];
          
          const contract = new ethers.Contract(contractAddress, abi, provider);
          const data = await contract.getMeme(numericId);
          
          setMeme({
            id: id,
            name: data.title,
            flag: '🌍',
            country: data.country,
            year: data.originDate,
            desc: data.description,
            cid: data.cid,
            uploader: data.uploader
          });
        } else {
          const found = MEMES.find(m => String(m.id) === String(id));
          setMeme(found || MEMES[0]);
        }
      } catch (err) {
        console.error("Error fetching meme details:", err);
        setMeme(MEMES[0]);
      }
    };

    fetchMeme();
  }, [id]);

  if (!meme) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading meme details...</div>;

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
            {meme.name}
          </h1>

          <p className={styles.subtitle}>
            {meme.desc}
          </p>
        </div>

        {/* Hero Image / Graphic */}
        <div className={styles.heroBox}>
          <div className={styles.heroGrid}></div>
          {meme.cid ? (
            <img 
              src={`https://teal-certain-salamander-344.mypinata.cloud/ipfs/${meme.cid}`} 
              alt={meme.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', position: 'relative', zIndex: 1 }} 
            />
          ) : (
            <span className={styles.heroEmoji}>{meme.flag}</span>
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
            <div className={styles.descriptionBlock}>
              <h2 className={styles.heading}>About this Meme</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
                {meme.desc || "No description provided."}
              </p>
            </div>

            {meme.cid && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                <h2 className={styles.heading} style={{ marginTop: 0 }}>On-Chain Record</h2>
                <p style={{ margin: '0.5rem 0', wordBreak: 'break-all' }}>
                  <strong>Origin Country:</strong> {meme.country}
                </p>
                <p style={{ margin: '0.5rem 0', wordBreak: 'break-all' }}>
                  <strong>Origin Date:</strong> {meme.year}
                </p>
                <p style={{ margin: '0.5rem 0', wordBreak: 'break-all' }}>
                  <strong>Uploader:</strong> {meme.uploader}
                </p>
                <p style={{ margin: '0.5rem 0', wordBreak: 'break-all' }}>
                  <strong>IPFS CID:</strong>{' '}
                  <a 
                    href={`https://teal-certain-salamander-344.mypinata.cloud/ipfs/${meme.cid}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#002FA7', textDecoration: 'underline' }}
                  >
                    {meme.cid}
                  </a>
                </p>
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
