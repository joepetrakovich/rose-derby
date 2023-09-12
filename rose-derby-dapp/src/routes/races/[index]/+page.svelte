<script lang="ts">
    import PlaceBet from '$lib/PlaceBet.svelte';
    import DetermineResults from '$lib/DetermineResults.svelte';
    import { roseDerbyContractUnsigned } from '$lib/Stores.js';
    import { Horse, type Race } from '$lib/Models.js';
    import formatEther, { blockTimestampToDate } from "$lib/Utils";
    import { DateTime } from 'luxon';
    import { readable } from 'svelte/store';
    import HorseIcon from '$lib/images/HorseIcon.svelte';

    export let data;

    let { index } = data;
    let race: Race;
    let postTime: DateTime;
    let results: { horse: Horse, position: number }[] = [];

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
            .then(() => 
            {   
                if (race.finished) {
                 $roseDerbyContractUnsigned!
                    .getResults(index)
                    .then(r => {
                        results = r.map((r: bigint, i: number) => ({
                            horse: Horse[Number(r)], position: i+1, 
                        }));
                    });
                }
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
        {:else}
            <div class="results">
                <span>Results</span>
                <div>
                    {#each results as { horse, position }}
                        <div class="{position==1 ? 'first':''} {horse.toString().toLowerCase()}">
                            <span>{position}{position == 1 ? "st" : position == 2 ? "nd" : position == 3 ? "rd" : "th" }</span>     
                            <HorseIcon />
                        </div>
                    {/each}  
                </div> 
            </div>
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
    .results {
        background-color: var(--theme-color-pale-green);
        border-radius: 6px;
        padding: var(--container-padding);
    }
    .results span {
        display: block;
        margin-bottom: var(--space-2);
    }
    .results > div {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }
    .results > div > div {
        background-color: rgb(255, 255, 255);
        border-radius: 6px;
        padding: var(--space-1);
    }
    .results div.first {
        background-color: gold;
        border: 1px solid black;
    }
</style>