"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";

const { connectors } = getDefaultWallets({
  appName: "Next Dapp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
});

const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL!),
  },
  ssr: true,
  autoConnect: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#3b82f6", // blue-500
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
