"use client";

import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseAbi } from "viem";
import { useEffect, useMemo } from "react";

const COUNTER_ADDRESS = process.env
  .NEXT_PUBLIC_COUNTER_ADDRESS as `0x${string}`;

const ABI = parseAbi([
  "function count() view returns (uint256)",
  "function increment()",
  "event Incremented(address indexed by, uint256 newValue)",
]);

/** Turn noisy low-level errors into friendly messages */
function friendlyError(e: unknown): string {
  const msg =
    typeof e === "string"
      ? e
      : (e as { message?: string })?.message ?? "Something went wrong.";

  if (/Connector not connected/i.test(msg))
    return "Please connect your wallet to interact with the counter.";
  if (/user rejected|user denied|user canceled/i.test(msg))
    return "Transaction was rejected in your wallet.";
  if (/insufficient funds/i.test(msg))
    return "Insufficient test ETH for gas. Get some Sepolia ETH from a faucet.";
  if (/replacement fee too low|max fee per gas/i.test(msg))
    return "Gas settings are too low. Try again with default gas.";
  if (/nonce/i.test(msg)) return "Your account nonce looks out of sync. Try again.";
  if (/rate limit|429|Too Many Requests/i.test(msg))
    return "RPC is rate limited. Please try again in a moment.";

  return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
}

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // Pretty network name (only shown when connected)
  const networkName = useMemo(() => {
    if (!isConnected) return null;
    if (chainId === 11155111) return "Sepolia Testnet";
    if (chainId === 1) return "Ethereum Mainnet";
    return `Chain ID ${chainId}`;
  }, [chainId, isConnected]);

  // Read
  const { data: count, refetch } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: ABI,
    functionName: "count",
    query: { enabled: isConnected },
  });

  // Write
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  // Confirm
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    // When disconnected, we pass undefined so hooks don't show stale states
    hash: isConnected ? txHash : undefined,
  });

  // Refresh count after a confirmed tx
  useEffect(() => {
    if (isConnected && isConfirmed) refetch();
  }, [isConnected, isConfirmed, refetch]);

  // Choose error to show (only when connected)
  const errorToShow = isConnected ? writeError ?? confirmError : null;
  const errorText = errorToShow ? friendlyError(errorToShow) : "";

  // Derived "show" flags so messages disappear on disconnect
  const showHintDisconnected = !isConnected;
  const showConfirming = isConnected && isConfirming;
  const showConfirmed = isConnected && isConfirmed && !!txHash;
  const showError = isConnected && !!errorToShow;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-6 shadow-2xl">
      <h2 className="text-2xl font-semibold text-center">On-chain Counter</h2>

      {/* Network shown only when connected */}
      {isConnected ? (
        <p className="mt-2 text-sm text-zinc-400 text-center">
          Network: <span className="text-blue-400">{networkName}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-400 text-center">
          Connect your wallet to view and update the counter.
        </p>
      )}

      <div className="mt-6 flex justify-center">
        <span className="text-5xl font-mono font-bold text-emerald-400">
          {isConnected ? count?.toString() ?? "—" : "—"}
        </span>
      </div>

      <button
        onClick={() =>
          writeContract({
            address: COUNTER_ADDRESS,
            abi: ABI,
            functionName: "increment",
          })
        }
        disabled={!isConnected || isPending}
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {!isConnected
          ? "Connect Wallet to Increment"
          : isPending
          ? "Confirm in Wallet..."
          : "Increment"}
      </button>

      {/* Status / messages */}
      <div className="mt-4 text-center text-sm space-y-1">
        {showHintDisconnected && (
          <p className="text-yellow-400">
            ⚠️ Wallet not connected. Use the “Connect Wallet” button in the header.
          </p>
        )}

        {showConfirming && (
          <p className="text-yellow-400 animate-pulse">Waiting for confirmation…</p>
        )}

        {showConfirmed && (
          <p className="text-emerald-400">
            ✅ Confirmed!{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-emerald-300"
            >
              View on Etherscan
            </a>
          </p>
        )}

        {showError && (
          <p className="text-red-400 flex items-center gap-1 justify-center">
            ⚠️ {errorText}
          </p>
        )}
      </div>
    </section>
  );
}
