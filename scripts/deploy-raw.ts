// scripts/deploy-raw.ts
import { readFileSync } from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { createWalletClient, createPublicClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const RPC = (process.env.ALCHEMY_SEPOLIA_URL || "").trim();
const PK  = (process.env.PRIVATE_KEY || "").trim();

if (!/^0x[0-9a-fA-F]{64}$/.test(PK)) {
  throw new Error("PRIVATE_KEY must be 0x + 64 hex chars");
}

const account = privateKeyToAccount(PK as Hex);
const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC) });
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

// read Hardhat artifact
const artifactPath = path.join(process.cwd(), "artifacts/contracts/Counter.sol/Counter.json");
const { abi, bytecode } = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as Hex,
    account,
    args: [],                 // <-- REQUIRED (empty, since Counter has no constructor)
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Counter deployed to:", receipt.contractAddress);
}

main().catch((e) => { console.error(e); process.exit(1); });
