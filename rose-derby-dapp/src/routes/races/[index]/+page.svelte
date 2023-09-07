<script lang="ts">
    import PlaceBet from '$lib/PlaceBet.svelte';
    import { blockTimestampToDate } from "$lib/Utils";
    import { ethers } from "ethers";
    import DetermineResults from '$lib/DetermineResults.svelte';
    import type { Race } from '$lib/Models.js';
    import { roseDerbyContractUnsigned } from '$lib/Stores.js';

    export let data;
    let { index } = data;
    let race: Race;

    $: $roseDerbyContractUnsigned && loadRace();

    function loadRace() {
        $roseDerbyContractUnsigned?.races(index).then(r => race = r);
    }
</script>

<div class="container"> 
    {#if race}
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
                <PlaceBet {index} on:bet-placed={loadRace} />
            {:else} 
                <DetermineResults {index} />
            {/if}
        {/if}
    {:else}
        Loading race...
    {/if}
</div>

<style>
    .container, .race {
        display: flex;
        flex-direction: column;
    }
</style>