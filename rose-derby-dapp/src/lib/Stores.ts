import { Events, OasisNetworkStatus, type Race } from "./Models";
import { getOasisNetworkConnectionStatus } from "./Network";
import { readable, derived, type Readable, type Subscriber, type Unsubscriber } from "svelte/store";
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
        let wrapped = sapphire.wrap(window.ethereum);
        const sign = new ethers.BrowserProvider(wrapped)
            .getSigner()
            .then(signer => {
                set(new ethers.Contract(
                    contractAddress.RoseDerby,
                    RoseDerbyArtifact.abi,
                    signer
                ))
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

export const races: Readable<Race[]> = derived(roseDerbyContractUnsigned, ($contract, set) => {
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

export const useMediaQuery: (mediaQueryString: string) => Readable<boolean> = (mediaQueryString: string) => {
    const matches = readable(false, (set) => {
        const m: MediaQueryList = window.matchMedia(mediaQueryString);
        set(m.matches);

        const listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any = e => set(e.matches);
        m.addEventListener("change", listener);

        return () => m.removeEventListener("change", listener);
    });

    return matches;
}
