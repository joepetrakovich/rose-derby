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

export interface Race {
    take: bigint;
    callerIncentive: bigint;
    postTime: bigint;
    pool: bigint;
    finished: boolean;
  }

export enum Horse { Black = 0, Blue = 1, Green = 2, Red = 3, White = 4 }

export const Events = { 
    RaceScheduled: "RaceScheduled",
    BetPlaced: "BetPlaced", 
    RaceResultsDetermined: "RaceResultsDetermined"
 }