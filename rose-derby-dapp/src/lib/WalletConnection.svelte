<script lang="ts">
    import CurrentAccount from '$lib/CurrentAccount.svelte';
    import { OASIS_SAPPHIRE_TESTNET, connectWallet, switchNetworkOrAddIfNotExists } from "$lib/Network";
    import { OasisNetworkStatus } from '$lib/Models';
    import { oasisNetworkStatus } from '$lib/Stores';

    const handleConnectToSapphire = () => {
       switchNetworkOrAddIfNotExists(OASIS_SAPPHIRE_TESTNET);
    };

    const handleConnectWallet = () => {
        connectWallet();
    }
</script>

<div>
    {#if $oasisNetworkStatus === OasisNetworkStatus.INITIALIZING}
        <button disabled>Initializing...</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.PROVIDER_NOT_FOUND}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.WALLET_NOT_CONNECTED}
        <button on:click={handleConnectWallet}>Connect</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.ON_SAPPHIRE_PARATIME}
        <CurrentAccount />
    {:else}
        <button on:click={handleConnectToSapphire}>Connect to Sapphire</button>
    {/if}
</div>

<style>
    button {
        background-color: var(--theme-color-rose);
        border: none;
        padding: var(--button-padding);
        color: #fff;
        border-radius: var(--button-radius);
    }
    button:hover {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
</style>
