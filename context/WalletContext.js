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
        setAddress(accounts[0]);
        setConnected(true);
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
