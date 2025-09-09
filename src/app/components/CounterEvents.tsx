"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { parseAbiItem } from "viem";

type Row = {
  id: string; // txHash:logIndex
  label: "inc" | "dec";
  by: string;
  value: string;
};

export default function CounterEvents({ address }: { address: `0x${string}` }) {
  const { address: myAddr, isConnected } = useAccount();
  const [rows, setRows] = useState<Row[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  // clear when disconnect
  useEffect(() => {
    if (!isConnected) {
      setRows([]);
      seenRef.current.clear();
    }
  }, [isConnected]);

  // subscribe only when connected
  useWatchContractEvent({
    address,
    abi: [
      parseAbiItem("event Incremented(address indexed by, int256 newValue)"),
      parseAbiItem("event Decremented(address indexed by, int256 newValue)"),
    ],
    enabled: isConnected, // wagmi v2 supports enabled in many hooks; if not, it will be ignored safely
    onLogs: (logs) => {
      const mine = logs.filter(
        (l) => myAddr && String(l.args?.by).toLowerCase() === myAddr.toLowerCase()
      );
      const next: Row[] = [];
      for (const l of mine) {
        const id = `${l.transactionHash}:${l.logIndex}`;
        if (seenRef.current.has(id)) continue;
        seenRef.current.add(id);
        next.push({
          id,
          label: l.eventName === "Incremented" ? "inc" : "dec",
          by: String(l.args?.by),
          value: String(l.args?.newValue),
        });
      }
      if (next.length) {
        setRows((prev) => [...next.reverse(), ...prev].slice(0, 25));
      }
    },
  });

  if (!isConnected) {
    return <p className="text-sm text-zinc-400">Connect to see your events.</p>;
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Recent increments</h3>
      <ul className="text-sm space-y-2">
        {rows.length === 0 && <li className="text-zinc-400">No events yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                r.label === "inc" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="truncate max-w-[14rem]">{r.by}</span>
            <span className="opacity-70">→</span>
            <span className="tabular-nums">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
