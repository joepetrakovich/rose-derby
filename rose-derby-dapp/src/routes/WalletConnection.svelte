<script lang="ts">
    import { Jazzicon } from 'ethers-svelte/components';
    import { truncateWithCenterEllipses } from "$lib/Utils";
    import { OASIS_SAPPHIRE_TESTNET, connectWallet, oasisNetworkStatus, signerAddress, switchNetworkOrAddIfNotExists } from "$lib/Network";
    import { OasisNetworkStatus } from '$lib/Models';

    let classes: string;
    export { classes as class };

    const handleConnectToSapphire = () => {
       switchNetworkOrAddIfNotExists(OASIS_SAPPHIRE_TESTNET);
    };

    const handleConnectWallet = () => {
        connectWallet();
    }

</script>

<div class={classes}>
    {#if $oasisNetworkStatus === OasisNetworkStatus.INITIALIZING}
        <button disabled>Initializing...</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.PROVIDER_NOT_FOUND}
        <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.WALLET_NOT_CONNECTED}
        <button on:click={handleConnectWallet}>Connect</button>
    {:else if $oasisNetworkStatus === OasisNetworkStatus.ON_SAPPHIRE_PARATIME}
        <span title="{$signerAddress}">
            <Jazzicon address="{$signerAddress}" size={32} />
            {truncateWithCenterEllipses($signerAddress, 13)}
        </span>
    {:else}
        <button on:click={handleConnectToSapphire}>Connect to Sapphire</button>
    {/if}
</div>

<style>
    span {
        display: flex;
        align-items: center;
        gap: var(--base-gap);
    }
</style>
