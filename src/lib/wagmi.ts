import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "Cartel",
    appDescription: "To unite the universe",
    appUrl: "https://cartel.sh",
    appIcon: "https://cartel.sh/favicon.ico",
  })
);