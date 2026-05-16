import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export default function ConnectWallet() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ visibility: mounted ? 'visible' : 'hidden', minHeight: '40px' }}>
      <ConnectButton
        label="connect wallet"
        accountStatus="address"
        chainStatus="none"
        showBalance={false}
      />
    </div>
  );
}
