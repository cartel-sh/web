import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  coinbaseWallet,
  rabbyWallet,
  metaMaskWallet,
  walletConnectWallet,
  zerionWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        zerionWallet,
        coinbaseWallet,
        ledgerWallet,
        rabbyWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'Cartel',
    projectId,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});