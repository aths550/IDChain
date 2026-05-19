import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/IwzLRdZq-QwKRtrf9AqEp",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
