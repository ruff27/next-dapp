"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

const config = getDefaultConfig({
  appName: "Next dApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
  transports: { [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL) },
});

const queryClient = new QueryClient();

function RainbowThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Server render: lock to dark to avoid SSR/CSR mismatch
  const theme = !mounted
    ? darkTheme({ accentColor: "#3b82f6" })
    : resolvedTheme === "light"
    ? lightTheme({ accentColor: "#3b82f6" })
    : darkTheme({ accentColor: "#3b82f6" });

  return <RainbowKitProvider theme={theme} modalSize="compact">{children}</RainbowKitProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <RainbowThemeBridge>{children}</RainbowThemeBridge>
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
