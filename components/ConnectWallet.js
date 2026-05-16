import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ minHeight: '40px' }} />;

  return (
    <div style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
      <ConnectButton />
    </div>
  );
}
