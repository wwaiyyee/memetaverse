import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
  return (
    <ConnectButton
      label="connect wallet"
      accountStatus="address"
      chainStatus="none"
      showBalance={false}
    />
  );
}
