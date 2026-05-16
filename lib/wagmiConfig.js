import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'Memetaverse',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains: [monadTestnet],
  ssr: true,
});
