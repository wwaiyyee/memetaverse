import { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  async function connect() {
    if (connected) return;
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize ethers provider and signer
        const { BrowserProvider } = await import('ethers');
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        setAddress(accounts[0]);
        setConnected(true);
        // Expose provider and signer globally or simply know they are available when connected
        window.provider = provider;
        window.signer = signer;

      } catch (err) {
        console.error('Wallet connect error:', err);
      }
    } else {
      alert('No wallet detected. Install MetaMask or a Monad-compatible wallet.');
    }
  }

  return (
    <WalletContext.Provider value={{ connected, address, connect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
