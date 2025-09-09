"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { parseAbiItem } from "viem";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Point = { t: number; value: number };

export default function CounterChart({ address }: { address: `0x${string}` }) {
  const { isConnected, address: myAddr } = useAccount();
  const [data, setData] = useState<Point[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useWatchContractEvent({
    address,
    abi: [
      parseAbiItem("event Incremented(address indexed by, int256 newValue)"),
      parseAbiItem("event Decremented(address indexed by, int256 newValue)"),
    ],
    enabled: isConnected,
    onLogs: (logs) => {
      const mine = logs.filter(
        (l) => myAddr && String(l.args?.by).toLowerCase() === myAddr.toLowerCase()
      );
      const rows: Point[] = [];
      for (const l of mine) {
        const id = `${l.transactionHash}:${l.logIndex}`;
        if (seen.current.has(id)) continue;
        seen.current.add(id);
        rows.push({ t: Date.now(), value: Number(l.args?.newValue) });
      }
      if (rows.length) setData((prev) => [...prev, ...rows].slice(-30));
    },
  });

  useEffect(() => {
    if (!isConnected) {
      setData([]);
      seen.current.clear();
    }
  }, [isConnected]);

  if (!isConnected) {
    return <p className="text-sm text-zinc-400">Connect to see your chart.</p>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="t"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            labelFormatter={(t) => new Date(t).toLocaleTimeString()}
            formatter={(val) => [String(val), "Counter"]}
            contentStyle={{ background: "#111", border: "1px solid #333" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
