"use client";
import { useAccount, usePublicClient, useWatchPendingTransactions } from "wagmi";
import { useEffect, useRef, useState } from "react";
import { onNewTx } from "../txBus";

type Item = { hash: `0x${string}`; status: "pending" | "confirmed" };

export default function TxFeed() {
  //  pull out isConnected as well
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  //  Clear when disconnected
  useEffect(() => {
    if (!isConnected) setItems([]);
  }, [isConnected]);

  // receive tx hashes immediately from our UI
  useEffect(() => {
    const off = onNewTx((hash) => {
      setItems((prev) => {
        if (prev.some((p) => p.hash === hash)) return prev;
        return [{ hash, status: "pending" }, ...prev].slice(0, 20);
      });
    });
    return off;
  }, []);

  // still listen to pending txs (may be very short-lived)
  useWatchPendingTransactions({
    onTransactions: (txs) => {
      if (!address) return;
      const mine = txs.filter((t) => t.from?.toLowerCase() === address.toLowerCase());
      if (mine.length === 0) return;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.hash));
        const incoming = mine
          .map((m) => ({ hash: m.hash as `0x${string}`, status: "pending" as const }))
          .filter((m) => !seen.has(m.hash));
        return [...incoming, ...prev].slice(0, 20);
      });
    },
  });

  // confirmation loop
  useEffect(() => {
    const id = setInterval(async () => {
      const current = itemsRef.current;
      if (current.length === 0) return;
      const updated = await Promise.all(
        current.map(async (n) => {
          if (n.status === "confirmed") return n;
          try {
            const r = await publicClient.getTransactionReceipt({ hash: n.hash });
            return r ? { ...n, status: "confirmed" as const } : n;
          } catch {
            return n;
          }
        })
      );
      // only set if changed
      let changed = false;
      for (let i = 0; i < current.length; i++) {
        if (current[i].status !== updated[i].status) {
          changed = true;
          break;
        }
      }
      if (changed) setItems(updated);
    }, 3000);
    return () => clearInterval(id);
  }, [publicClient]);

  if (!address) return <p className="text-sm text-zinc-400">Connect to see your activity.</p>;

  return (
    <div className="mt-1">
      <h3 className="font-medium mb-2">Your recent transactions</h3>
      <div className="space-y-1">
        {items.length === 0 && <p className="text-sm text-zinc-400">No activity yet.</p>}
        {items.map((i) => (
          <a
            key={i.hash}
            target="_blank"
            rel="noreferrer"
            className="block text-sm underline"
            href={`https://sepolia.etherscan.io/tx/${i.hash}`}
          >
            {i.hash.slice(0, 10)}… — {i.status}
          </a>
        ))}
      </div>
    </div>
  );
}
