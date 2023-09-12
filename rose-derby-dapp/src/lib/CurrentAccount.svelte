<script lang="ts">
    import { Jazzicon } from 'ethers-svelte/components';
    import { truncateWithCenterEllipses } from "$lib/Utils";
    import { signerAddress } from '$lib/Stores';
    
    export let showAddress: boolean = false;
</script>

<span title="Current Address: {$signerAddress}">
    <Jazzicon address="{$signerAddress}" size={32} />
    {#if showAddress}
        {truncateWithCenterEllipses($signerAddress, 13)}
    {/if}
</span>    

<style>
    span {
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }
</style>



