import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(), // This supports MetaMask, Rainbow, and other browser wallets
  ],
  transports: {
    [mainnet.id]: http(),
  },
});