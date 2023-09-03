<script lang="ts">
    import PlaceBet from './PlaceBet.svelte';
    import { connectedToSapphire, roseDerbyContractUnsigned } from "$lib/Stores";
    import { page } from "$app/stores";
    import { blockTimestampToDate } from "$lib/Utils";
    import type { Race } from '$lib/Models';
    import { ethers } from "ethers";
    import DetermineResults from './DetermineResults.svelte';

    $: ({ index } = $page.params);

    let race: Race;

    $: {
        if ($connectedToSapphire) {
            $roseDerbyContractUnsigned?._races(index)
            .then(result => race = result)
            .catch(console.log);
        }
    }
</script>

{#if race}
    <div class="container">
        <div class="race">
            <span>Race # {index}</span>
            <span>Take: {race.take}</span>
            <span>Caller Incentive: {race.callerIncentive}</span>
            <span>Post Time: {blockTimestampToDate(race.postTime).toLocaleString()}</span>
            <span>Pool: {ethers.formatEther(race.pool)}</span>
            <span>Finished: {race.finished}</span>
        </div>
        
        {#if !race.finished}
            {#if new Date() < blockTimestampToDate(race.postTime)}
                <PlaceBet {index} />
            {:else} 
                <DetermineResults {index} />
            {/if}
        {/if}
    </div>
{/if}

<style>
    .container, .race {
        display: flex;
        flex-direction: column;
    }
</style>