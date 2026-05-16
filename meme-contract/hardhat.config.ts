import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          evmVersion: "prague",
        },
      },
    },
  },
  networks: {
    monadTestnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("MONAD_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
});
