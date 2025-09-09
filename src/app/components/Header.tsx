"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import WalletStatus from "./WalletStatus";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-white/60 dark:bg-zinc-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Left: logo + title only clickable */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="Next Dapp Logo"
            width={28}
            height={28}
            priority
            className="h-7 w-7"
          />
          <span className="text-lg font-semibold tracking-tight group-hover:opacity-90 sm:text-xl">
            Next Dapp
          </span>
        </Link>

        {/* Right: wallet + theme toggle */}
        <div className="flex items-center gap-3">
          <WalletStatus />
          <ThemeToggle />
          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: true }}
            chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
}
