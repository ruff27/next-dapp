// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-viem";
import * as dotenv from "dotenv";
dotenv.config();

const SEPOLIA_URL = (process.env.ALCHEMY_SEPOLIA_URL || "").trim();
const PK = (process.env.PRIVATE_KEY || "").trim();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      type: "http",
      url: SEPOLIA_URL,
      accounts: PK ? [PK] : [],
      chainId: 11155111,
    },
  },
};
export default config;
