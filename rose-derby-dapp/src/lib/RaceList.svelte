<script lang="ts">
    import { races, useMediaQuery } from "$lib/Stores";
    import OasisLogo from "$lib/images/oasis-logo.png"
    import formatEther, { bigIntToHorse, blockTimestampToDate, dateFormat } from "$lib/Utils";
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import { readable, type Readable } from "svelte/store";
    import { onMount } from "svelte";

    const findNextRace = () => $races
        .map((r, i) => ({index: i, postTime: DateTime.fromJSDate(blockTimestampToDate(r.postTime)) }))
        .filter(r => r.postTime > DateTime.now())
        .reduce((prev, current) => (prev.postTime < current.postTime) ? prev : current, {index: -1, postTime: DateTime.now().plus({ days: 9999 })});
    
    $: nextRace = $races && findNextRace();

    const nextRaceStartsIn = readable<DateTime|null>(null, set => {
        const interval = setInterval(() => {
            if (nextRace && nextRace.postTime > DateTime.now()) {
                set(nextRace.postTime);
            } else {
                nextRace = findNextRace();
                set(null);
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    let atLeast400pxWide: Readable<boolean>;
    
    onMount(() => {
        atLeast400pxWide = useMediaQuery("(min-width: 400px)");
    })
</script>

<div>
    <header>
        <span>
            Races
            {#if $atLeast400pxWide && nextRace?.index > -1 && $nextRaceStartsIn && $nextRaceStartsIn > DateTime.now()}
                <a href="/races/{nextRace.index}">Next Race: {$nextRaceStartsIn.toRelative()}</a>
            {/if}
        </span>
        <button on:click={() => goto("/races/new")}>+ Create Race</button>
    </header>
    <div>
        <table>
            <thead>
                <tr>
                    <td>#</td>
                    <td>Post Time</td>
                    <td title="% of pool given to race organizer">Take</td>
                    <td title="% of pool given to race results caller">Incentive</td>
                    <td>Pool <img src="{OasisLogo}" alt="Oasis Logo" height="16px" /></td>
                </tr>
            </thead>
            <tbody>
                {#each $races as { postTime, take, callerIncentive, pool, finished, winner }, index}
                {@const time = DateTime.fromJSDate(blockTimestampToDate(postTime))}
                <tr class:finished on:click={() => goto(`/races/${index}`)}>
                    <td>
                        <span>{index} <i class="winner-dot" style:background-color={bigIntToHorse(winner).toLowerCase()}></i></span>
                    </td>
                    <td>{time.toLocaleString(dateFormat)}</td>
                    <td>{take}%</td>
                    <td>{callerIncentive}%</td>
                    <td>{formatEther(pool, 0)}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>
<small>Contract Owner Take: 2% Fixed</small>

<style>
    div {
        padding-top: var(--container-padding);
        padding-bottom: var(--container-padding);
        border-radius: var(--container-radius);
        background-color: #fff;
        box-shadow: 0 0 12px 0px rgba(0, 0, 0, 0.15);
    }
    div > div {
        max-height: 450px;
        overflow: auto;
        box-shadow: unset;
        padding: 0 0;
        border-radius: unset;
    }
    header, table {
        padding-left: var(--container-padding);
        padding-right: var(--container-padding);
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: bold;
        padding-bottom: var(--container-padding);
    }
    header a {
        color: gray;
        font-size: 0.85rem;
        padding-left: var(--space-2);
    }
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
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9em;
        font-family: sans-serif;
    }
    thead tr {
        background-color: var(--theme-color-pale-green);
        color: #000;
        text-align: left;
    }
    thead td {
        text-align: center;
    }
    thead td:last-child {
        display: flex;
        align-items: top;
        gap: 4px;
    }
    td {
        padding: 12px 10px;
    }
    tbody tr {
        border-bottom: 1px solid #dddddd;
        text-align: right;
    }
    tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    tbody tr:hover {
        background-color: rgba(202, 202, 202, 0.75);
        cursor: pointer;
    }
    tr.finished {
        background-color: rgba(196, 196, 196, 0.50);
        color: gray;
    }
    tbody td:first-child span {
        display: flex;
        align-items: center;
        gap: var(--space-2);

    }
    .winner-dot {
        height: 10px;
        width: 10px;
        border-radius: 14px;
    }
    tr:not(.finished) .winner-dot {
        display: none;
    }
    small {
        color: gray;
        text-align: right;
        font-size: 0.8rem;
    }
</style>