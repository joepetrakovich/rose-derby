<script lang="ts">
    import { races } from "$lib/Stores";
    import OasisLogo from "$lib/images/oasis-logo.png"
    import formatEther, { blockTimestampToDate } from "$lib/Utils";
    import { goto } from "$app/navigation";
    import { DateTime } from "luxon";
    import type { Race } from "./Models";

    const sortRaces = (a: Race, b: Race): number => {
        if (a.postTime > b.postTime) {
            return 1;
        }
        if (a.postTime < b.postTime) {
            return -1;
        }
        return 0;
    }
</script>

<div>
    <span>
        Races
        <button on:click={() => goto("/races/new")}>+ Create Race</button>
    </span>
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
                {#each $races as { postTime, take, callerIncentive, pool, finished }, i}
                {@const time = DateTime.fromJSDate(blockTimestampToDate(postTime))}
                <tr class:finished on:click={() => goto(`/races/${i}`)}>
                    <td>{i}</td>
                    <td>{time.toLocaleString({...DateTime.DATETIME_SHORT, month: '2-digit', day: '2-digit', year: '2-digit'})}</td>
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
    div > span, table {
        padding-left: var(--container-padding);
        padding-right: var(--container-padding);
    }
    div > span {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: bold;
        padding-bottom: var(--container-padding);
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
        padding: 12px 15px;
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
    small {
        color: gray;
        text-align: right;
        font-size: 0.8rem;
    }
</style>