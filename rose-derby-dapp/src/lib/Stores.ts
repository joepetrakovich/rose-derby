import { OasisNetworkStatus } from "./Models";
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
