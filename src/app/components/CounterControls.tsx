"use client";
import { useEffect, useRef, useState } from "react";
import { parseAbi } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ADDRESSES, DEFAULT_CHAIN_ID } from "../contracts";
import { notifyNewTx } from "../txBus";

const counterAbi = parseAbi([
  "function number() view returns (int256)",
  "function incBy(int256 x)",
  "function decBy(int256 x)",
]);

export default function CounterControls() {
  const { isConnected } = useAccount();

  const chain = ADDRESSES[DEFAULT_CHAIN_ID] || ADDRESSES[11155111];
  const counter = chain.counter as `0x${string}`;

  const { data: value } = useReadContract({
    address: counter,
    abi: counterAbi,
    functionName: "number",
    query: { enabled: isConnected },
    watch: true,
  });

  // free-typing amount; enforce min=1 on blur/submit
  const [amountStr, setAmountStr] = useState("1");
  const amountBig = amountStr === "" ? 1n : BigInt(amountStr);

  const [optimistic, setOptimistic] = useState<bigint | null>(null);

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // strict submit guard (prevents double-fire before wagmi flips isPending)
  const [submitting, setSubmitting] = useState(false);

  // push new tx to the feed exactly once
  const notified = useRef<string | null>(null);
  useEffect(() => {
    if (txHash && notified.current !== txHash) {
      notifyNewTx(txHash as `0x${string}`);
      notified.current = txHash;
      setSubmitting(false); 
    }
  }, [txHash]);

  useEffect(() => {
    if (!isConnected) {
      setOptimistic(null);
      notified.current = null;
      setSubmitting(false);
      reset?.();
    }
  }, [isConnected, reset]);

  useEffect(() => {
    if (isSuccess) setOptimistic(null);
  }, [isSuccess]);

  const bump = (delta: bigint) => {
    const current = (value as bigint | undefined) ?? 0n;
    setOptimistic(current + delta);
  };

  const onInc = () => {
    if (!isConnected || submitting || isPending) return;
    setSubmitting(true);
    bump(amountBig);
    try {
      writeContract({
        address: counter,
        abi: counterAbi,
        functionName: "incBy",
        args: [amountBig],
      });
    } catch {
      setOptimistic(null);
      setSubmitting(false);
    }
  };

  const onDec = () => {
    if (!isConnected || submitting || isPending) return;
    setSubmitting(true);
    bump(-amountBig);
    try {
      writeContract({
        address: counter,
        abi: counterAbi,
        functionName: "decBy",
        args: [amountBig],
      });
    } catch {
      setOptimistic(null);
      setSubmitting(false);
    }
  };

  const display = optimistic ?? ((value as bigint | undefined) ?? 0n);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl font-semibold tabular-nums">
          {isConnected ? String(display) : "—"}
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={amountStr}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return setAmountStr("");
            if (/^\d+$/.test(v)) setAmountStr(v);
          }}
          onBlur={() => {
            if (amountStr === "" || amountStr === "0") setAmountStr("1");
          }}
          className="w-16 px-2 py-1 text-center rounded-md border bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onInc}
          disabled={!isConnected || isPending || submitting}
          className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending || submitting ? "Submitting…" : "Increment"}
        </button>
        <button
          type="button"
          onClick={onDec}
          disabled={!isConnected || isPending || submitting}
          className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
        >
          Decrement
        </button>
      </div>

      {isConnected && txHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          View transaction
        </a>
      )}
      {isConnected && isSuccess && (
        <div className="text-emerald-400 text-sm">✅ Confirmed</div>
      )}
      {isConnected && error && (
        <div className="text-rose-400 text-sm">
          ⚠️ {error.shortMessage || error.message}
        </div>
      )}
    </div>
  );
}
