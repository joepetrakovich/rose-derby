import { type Network, OasisNetworkStatus } from "./Models";
import { ethers } from "ethers";

const SWITCH_CHAIN_ERROR_CHAIN_NOT_ADDED: number = 4902;
const UNRECOGNIZED_CHAIN_ERROR: number = -32603;

export const OASIS_SAPPHIRE_TESTNET: Network = {
    name: "Oasis Sapphire Testnet",
    chainIdHex:  "0x5aff",
    chainIdDecimal: 23295,
    rpcUrls: ["https://testnet.sapphire.oasis.dev"],
    blockExplorerUrls: ["https://testnet.explorer.sapphire.oasis.dev"],
    nativeCurrency: {
        name: "TEST", 
        symbol: "TEST",
        decimals: 18
    }
  }
  
  function addNetwork(network: Network) {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
            chainId: network.chainIdHex,
            rpcUrls: network.rpcUrls,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            blockExplorerUrls: network.blockExplorerUrls
        }]
    });
  }
  
  function switchNetwork(chainId: string) {
    return window.ethereum.request({
         method: 'wallet_switchEthereumChain',
         params: [{ chainId: chainId }]
    });
  }
  
  export function switchNetworkOrAddIfNotExists(network: Network) {
    switchNetwork(network.chainIdHex)
      .catch((error: { code: number; }) => {
          if (error.code === SWITCH_CHAIN_ERROR_CHAIN_NOT_ADDED ||
              error.code === UNRECOGNIZED_CHAIN_ERROR) {
              addNetwork(network);
          } else {
              throw error;
          }
      });
  }

  export function connectWallet() {
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((error: { code: number; }) => {
    if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
    } else {
        console.error(error);
    }
    });
}

export async function getOasisNetworkConnectionStatus(): Promise<OasisNetworkStatus> {
    try {    
        if (!window.ethereum) {
            return OasisNetworkStatus.PROVIDER_NOT_FOUND;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (!window.ethereum.selectedAddress) {
            return OasisNetworkStatus.WALLET_NOT_CONNECTED;
        }

        if (network.chainId.toString() === OASIS_SAPPHIRE_TESTNET.chainIdDecimal.toString()) {
            return OasisNetworkStatus.ON_SAPPHIRE_PARATIME;
        }
        
        return OasisNetworkStatus.ON_DIFFERENT_NETWORK;

    } catch (error) {
        console.error(`An error occurred while trying to connect to the Oasis network: ${error}`);
        return OasisNetworkStatus.PROVIDER_NOT_FOUND;
    }
}
