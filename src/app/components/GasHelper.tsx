"use client";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatGwei } from "viem";

export default function GasHelper() {
  const pc = usePublicClient();
  const [base, setBase] = useState<string>("—");

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const fee = await pc.getFeeHistory({ blockCount: 1, rewardPercentiles: [5] });
        const baseFee = fee.baseFeePerGas?.[0];
        if (baseFee) setBase(formatGwei(baseFee));
      } catch {
        // ignore network hiccups
      }
    }, 4000);
    return () => clearInterval(t);
  }, [pc]);

  return (
    <div className="inline-block text-xs px-2 py-1 rounded bg-zinc-800/60">
      Base fee ~ {base} gwei
    </div>
  );
}
