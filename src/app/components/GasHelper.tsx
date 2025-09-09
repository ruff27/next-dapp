"use client";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatGwei } from "viem";

export default function GasHelper() {
  const pc = usePublicClient();
  const [base, setBase] = useState<string>("–");

  useEffect(() => {
    if (!pc) return; 

    const t = setInterval(async () => {
      try {
        const fee = await pc.getFeeHistory({
          blockCount: 1,
          rewardPercentiles: [5],
        });
        const baseFee = fee.baseFeePerGas?.[0];
        if (baseFee) setBase(formatGwei(baseFee));
      } catch {}
    }, 8000);

    return () => clearInterval(t);
  }, [pc]);

  return (
    <div className="text-sm opacity-70">
      Gas: {base === "–" ? "Loading…" : `${base} gwei`}
    </div>
  );
}
