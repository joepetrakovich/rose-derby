<script lang="ts">
    import { globalAmountWon, horseWins, races } from "$lib/Stores";
    import { Horse } from "./Models";
    import formatNumber from "./Utils";

    $: raceWithlargestPool = $races.map((r, i) => ({i: i, pool: r.pool}))
        .reduce((prev, current) => (prev.pool > current.pool) ? prev : current, {i: -1, pool: 0n});

    $: topHorse = $horseWins.map((numWins, i) => ({i: i, numWins }))
        .reduce((prev, current) => (prev.numWins > current.numWins) ? prev : current);

</script>

<div class="stats">
    <div>
        <span>Largest Pool</span>
        <span>
            <a href="/races/{raceWithlargestPool.i}">
                {formatNumber(raceWithlargestPool.pool, 0)} ROSE
            </a>
        </span>
    </div>
    <div>
        <span>Global Winnings</span>
        <span>{formatNumber($globalAmountWon, 0)} ROSE</span>
    </div>
    <div>
        <span>Top Horse</span>
        <span>
            {#if topHorse.numWins === 0n}TIE{:else}{Horse[topHorse.i]}{/if}
        </span>
    </div>
</div>

<style>
    .stats {
        display: flex;
        justify-content: space-between;
        gap: var(--container-gap);
    }
    .stats > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--container-padding);
        border-radius: var(--container-radius);
        background-color: #fff;
        flex-grow: 1;
    }
    .stats > div:nth-child(1) {
        background-color: var(--theme-color-khaki);
        color: var(--text-color-white);
    }
    .stats > div:nth-child(2) {
        background-color: var(--theme-color-light-brown);
    }
    .stats > div:nth-child(3) {
        background-color: #fff;
    }
    span:first-child {
        font-weight: bold;
    }
</style>

