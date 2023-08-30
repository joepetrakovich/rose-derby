import '@oasisprotocol/sapphire-hardhat';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
        sapphire_localnet: {
            url: "http://localhost:8545/",
            accounts: process.env.PRIVATE_KEYS?.split(','),
            chainId: 0x5afd
         },
         sapphire_testnet: {
          url: "https://testnet.sapphire.oasis.dev",
          accounts: process.env.PRIVATE_KEYS?.split(','),
          chainId: 0x5aff,
        }
  },
  mocha: {
    timeout: 60000
  }
};

export default config;
