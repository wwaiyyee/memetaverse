import { useState } from 'react';

export default function ConnectWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (connected) return;
    setLoading(true);
    try {
      // Hook: replace with real wallet provider (e.g. wagmi, ethers, monad wallet)
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        setConnected(true);
      } else {
        alert('No wallet detected. Install MetaMask or a Monad-compatible wallet.');
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1e1a2e] border border-purple-500/40 text-sm text-white hover:bg-[#2a2045] hover:border-purple-400/60 transition-colors disabled:opacity-50"
    >
      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
      {loading ? 'connecting...' : connected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'connect wallet'}
    </button>
  );
}
