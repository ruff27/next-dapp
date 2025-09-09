"use client";
import { useAccount, useBalance, useEnsName, useChainId } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export default function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: ens } = useEnsName({ address, chainId: mainnet.id });
  const { data: bal } = useBalance({ address });

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="px-2 py-1 rounded bg-zinc-800/50">
        {ens ?? `${address?.slice(0, 6)}…${address?.slice(-4)}`}
      </span>
      <span className="hidden sm:inline">
        {bal?.formatted} {bal?.symbol}
      </span>
      <span
        className={`px-2 py-1 rounded ${
          chainId === sepolia.id ? "bg-emerald-500/20" : "bg-amber-500/20"
        }`}
      >
        {chainId === sepolia.id ? "Sepolia" : `Chain ${chainId}`}
      </span>
    </div>
  );
}
