"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="\logo.svg" 
            alt="Next Dapp Logo"
            className="w-7 h-7"
          />
          <span className="text-lg sm:text-xl font-semibold">Next Dapp</span>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </header>
  );
}
