// src/app/page.tsx
"use client";
import GasHelper from "./components/GasHelper";
import TxFeed from "./components/TxFeed";
import CounterEvents from "./components/CounterEvents";
import CounterControls from "./components/CounterControls";
import CounterChart from "./components/CounterChart";
import { ADDRESSES, DEFAULT_CHAIN_ID } from "./contracts";

const card =
  "rounded-2xl border p-6 backdrop-blur " +
  "border-zinc-200/70 bg-white/60 shadow-sm " +          // light
  "dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_1px_0_rgb(255_255_255/0.05)]"; // dark

export default function Home() {
  const chain = ADDRESSES[DEFAULT_CHAIN_ID] || ADDRESSES[11155111];
  const counter = chain.counter!;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className={card}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Counter Dapp</h2>
            <p className="text-sm opacity-70">
              Interact with your contract on Sepolia. See live gas, your tx feed, and contract events.
            </p>
          </div>
          <GasHelper />
        </div>
      </section>

      {/* Controls */}
      <section className={card + " space-y-4"}>
        <h3 className="text-base font-medium">Counter Controls</h3>
        <CounterControls />
      </section>

      {/* Feed + Events */}
      <div className="grid gap-8 md:grid-cols-2">
        <section className={card}>
          <TxFeed />
        </section>
        <section className={card}>
          <CounterEvents address={counter} />
        </section>
      </div>

      {/* Chart */}
      <section className={card}>
        <h3 className="mb-3 text-base font-medium">Counter over time</h3>
        <CounterChart address={counter} />
      </section>
    </div>
  );
}
