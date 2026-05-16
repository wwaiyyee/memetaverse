import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

export default function ConnectWallet() {
  const { connected, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      await connect();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#002FA7]/30 text-sm text-[#002FA7] hover:bg-[#002FA7] hover:text-white transition-colors disabled:opacity-50"
    >
      <span className="w-2 h-2 rounded-full bg-[#002FA7] inline-block" />
      {loading ? 'connecting...' : connected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'connect wallet'}
    </button>
  );
}
