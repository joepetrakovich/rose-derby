export interface Currency {
    name: string,
    symbol: string,
    decimals: number
};

export interface Network {
    name: string,
    chainIdHex: string,
    chainIdDecimal: number,
    rpcUrls: string[],
    blockExplorerUrls: string[],
    nativeCurrency: Currency
}

export enum OasisNetworkStatus { 
    INITIALIZING,
    WALLET_NOT_CONNECTED,
    PROVIDER_NOT_FOUND, 
    ON_DIFFERENT_NETWORK, 
    ON_SAPPHIRE_PARATIME
};
