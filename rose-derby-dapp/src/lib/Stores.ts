import { Events, OasisNetworkStatus, type Race } from "./Models";
import { getOasisNetworkConnectionStatus } from "./Network";
import { writable, readable, derived, type Readable, type Subscriber, type Unsubscriber } from "svelte/store";
import { ethers } from "ethers";
import * as sapphire from '@oasisprotocol/sapphire-paratime';
import RoseDerbyArtifact from "$lib/contracts/RoseDerby.json";
import contractAddress from "$lib/contracts/contract-address.json";

export const oasisNetworkStatus = readable<OasisNetworkStatus>(OasisNetworkStatus.INITIALIZING, set => {
    const interval = setInterval(async () => {
        const status = await getOasisNetworkConnectionStatus();
        set(status);
    }, 1000);

    return function stop() {
        clearInterval(interval); 
    }
});

export const connectedToSapphire: Readable<boolean> = derived(oasisNetworkStatus, ($oasisNetworkStatus) => $oasisNetworkStatus == OasisNetworkStatus.ON_SAPPHIRE_PARATIME);

export const signerAddress = readable<string>('', set => {
    const interval = setInterval(async () => {
        if (window.ethereum) {
            set(window.ethereum.selectedAddress);
        }
    }, 1000);

    return function stop() {
        clearInterval(interval); 
    }
});

export const roseDerbyContract: Readable<ethers.Contract|undefined> = derived([oasisNetworkStatus, signerAddress], ([$networkStatus], set) => {
    if ($networkStatus == OasisNetworkStatus.ON_SAPPHIRE_PARATIME) {
        sapphire.wrap(new ethers.BrowserProvider(window.ethereum))
        .getSigner()
        .then(signer => {
            set(new ethers.Contract(
                contractAddress.RoseDerby,
                RoseDerbyArtifact.abi,
                signer))
        });
    } else {
        set(undefined);
    }
});

export const roseDerbyContractUnsigned: Readable<ethers.Contract|undefined> = derived([oasisNetworkStatus, signerAddress], ([$networkStatus], set) => {
    if ($networkStatus == OasisNetworkStatus.ON_SAPPHIRE_PARATIME) {
        set(new ethers.Contract(
            contractAddress.RoseDerby,
            RoseDerbyArtifact.abi,
            sapphire.wrap(new ethers.BrowserProvider(window.ethereum))));
    } else {
        set(undefined);
    }
});

export const horseWins: Readable<bigint[]> = derived(roseDerbyContractUnsigned, ($contract, set) => {
    if ($contract) {
        $contract.getHorseWins()
        .then(set)
        .catch(console.log); 
    }
}, [0n,0n,0n,0n,0n]);

export const races: Readable<Race[]> = derived(roseDerbyContract, ($contract, set) => {
    if ($contract) {
        $contract.getRaces()
        .then(races => set(races))
        .catch(console.log); 
    }
}, []);

export const globalAmountWon: Readable<bigint> = derived(roseDerbyContractUnsigned, ($contract, set) => {
    if ($contract) {
        $contract.totalWon()
        .then(set)
        .catch(console.log); 
    }
}, BigInt(0));

export const lastKnownBlockTimestamp: Readable<Date|undefined> = derived(oasisNetworkStatus, ($networkStatus, set) => {
    const interval = setInterval(async () => {
        if ($networkStatus == OasisNetworkStatus.ON_SAPPHIRE_PARATIME) {
            const provider = sapphire.wrap(new ethers.BrowserProvider(window.ethereum));
            provider.getBlockNumber()
            .then(provider.getBlock)
            .then(block => {
                if (block) {
                    set(new Date(block.timestamp * 1000));
                }
            })
            .catch(console.log);
        } else {
            set(undefined);
        }
    }, 1000);

    return function stop() {
        clearInterval(interval); 
    }
});