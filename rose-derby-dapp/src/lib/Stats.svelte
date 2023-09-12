<script lang="ts">
    import { globalAmountWon, horseWins, races } from "$lib/Stores";
    import { Horse } from "./Models";
    import formatNumber, { blockTimestampToDate } from "./Utils";

    $: raceWithLargestPool = $races
        .map((r, i) => ({i: i, pool: r.pool, postTime: r.postTime }))
        .filter(r => blockTimestampToDate(r.postTime) > new Date())
        .reduce((prev, current) => (prev.pool > current.pool) ? prev : current, {i: -1, pool: 0n});

    let topHorses: {index: number, numWins: bigint }[] = [];
    let mostWins: bigint = 0n;
    $: {
        mostWins = $horseWins.reduce((prev, current) => (prev > current) ? prev : current)
        topHorses = $horseWins
            .map((numWins, i) => ({index: i, numWins}))
            .filter(horse => horse.numWins == mostWins)
    }

</script>

<div class="stats">
    {#if raceWithLargestPool.pool == 0n}
    <div><span>Largest Pool</span><span>0 ROSE</span></div>
    {:else}
    <a href="/races/{raceWithLargestPool.i}">
        <span>Largest Pool</span>
        <span>{formatNumber(raceWithLargestPool.pool, 0)} ROSE</span>
    </a>
    {/if}
    <div>
        <span>Global Winnings</span>
        <span>{formatNumber($globalAmountWon, 0)} ROSE</span>
    </div>
    <div>
        <span>Top Horse{#if topHorses.length > 1}s{/if}</span>
        {#if mostWins === 0n}
            <span>TBD</span>
        {:else}
            <span class="top-horses">
                {#each topHorses as topHorse}
                    <i class="top-horse-dot" style:background-color="{Horse[topHorse.index].toLowerCase()}"></i>
                {/each}
            </span>
        {/if}

    </div>
</div>

<style>
    .stats {
        display: flex;
        justify-content: space-between;
        gap: var(--container-gap);
    }
    .stats > div, .stats > a {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--space-2);
        border-radius: var(--container-radius);
        background-color: #fff;
        flex-grow: 1;
    }
    .stats > a:hover {
        filter: brightness(110%);
    }
    .stats > a, .stats > div:nth-child(1) {
        background-color: var(--theme-color-khaki);
        color: var(--text-color-white);
    }
    .stats > div:nth-child(2) {
        background-color: var(--theme-color-light-brown);
    }
    .stats > div:nth-child(3) {
        background-color: #fff;
    }
    .stats > div:nth-child(3) span.top-horses {
        background-color: rgb(203, 203, 203);
        border-radius: 14px;
        padding: 2px;
        display: flex;
        color: white;
        font-size: 0.8rem;
        gap: var(--space-2);
        margin-top: var(--space-1);
    }
    span:first-child {
        font-size: 0.75rem;
        text-align: center;
    }
    span:last-child {
        font-weight: bold;
        font-size: 0.9rem;
    }
    .top-horse-dot {
        height: 10px;
        width: 10px;
        border-radius: 14px;
    }
    a:link, a:visited, a:active {
        text-decoration: none;
        color: white;
    }
</style>

