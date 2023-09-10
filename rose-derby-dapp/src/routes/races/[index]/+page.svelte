<script lang="ts">
    import PlaceBet from '$lib/PlaceBet.svelte';
    import DetermineResults from '$lib/DetermineResults.svelte';
    import { roseDerbyContractUnsigned } from '$lib/Stores.js';
    import type { Race } from '$lib/Models.js';
    import formatEther, { blockTimestampToDate, dateFormat } from "$lib/Utils";
    import { ethers } from "ethers";
    import { DateTime } from 'luxon';
    import { readable } from 'svelte/store';

    export let data;

    let { index } = data;
    let race: Race;
    let postTime: DateTime;

    $: $roseDerbyContractUnsigned && loadRace();

    const startsIn = readable<string>('...', set => {
        const interval = setInterval(() => set(postTime?.toRelative() ?? '...'), 1000);
        return () => clearInterval(interval);
    });

    function loadRace() {
        $roseDerbyContractUnsigned
            ?.races(index)
            .then(r => {
                race = r;
                postTime = DateTime.fromJSDate(blockTimestampToDate(race.postTime));
            })
            .catch(console.log);
    }
</script>

<div> 
    {#if race}
        <div>
            <span>Race # {index}</span> 
            {#if postTime > DateTime.now()} 
                <small>Starts {$startsIn}</small>
            {:else if !race.finished}
                <small>Horses are ready!</small>
            {/if}
        </div>

        <div class="info">
            <div>
                <span>Pool</span>
                <span>{formatEther(race.pool, 0)} ROSE</span>
            </div>
            <div>
                <span>Take</span>
                <span>{race.take}%</span>
            </div>
            <div>
                <span>Caller Incentive</span>
                <span>{race.callerIncentive}%</span>
            </div>
        </div>

        {#if !race.finished}
            {#if DateTime.now() < postTime}
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
    div:not(div > div) {
        display: flex;
        flex-direction: column;
        gap: var(--container-gap);
        padding: var(--container-padding);
        border-radius: var(--container-radius);
        background-color: #fff;
    }
    div > div:first-child {
        display: flex;
        justify-content: space-between;
    }
    div > div > small, .info span:first-child {
        color: gray;
    }
    .info span:nth-child(2) {
        font-size: 1.2rem;
    }
    div > div:nth-child(2) {
        display: flex;
        justify-content: space-evenly;
    }
    div > div:nth-child(2) > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }
</style>