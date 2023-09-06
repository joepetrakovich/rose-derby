<script lang="ts">
    import { races } from "$lib/Stores";
    import formatEther, { blockTimestampToDate } from "$lib/Utils";
    import { goto } from "$app/navigation";
    import { ethers } from "ethers";
</script>

<div>
    <span>
        Races
        <button on:click={() => goto("/races/new")}>+ Create Race</button>
    </span>
    <table>
        <thead>
        <tr>
            <td>#</td>
            <td>Post Time</td>
            <td title="% of pool given to race organizer">Take</td>
            <td title="% of pool given to race results caller">Incentive</td>
            <td>Pool (ROSE)</td>
        </tr>
        </thead>
        <tbody>
            {#each $races as race, i}
            <tr on:click={() => goto(`/races/${i}`)}>
                <td>{i}</td>
                <td>{blockTimestampToDate(race.postTime).toLocaleString()}</td>
                <td>{race.take}%</td>
                <td>{race.callerIncentive}%</td>
                <td>{formatEther(race.pool, 0)}</td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    div {
        padding-top: var(--container-padding);
        /* padding-bottom: var(--container-padding); */
        border-radius: var(--container-radius);
        background-color: #fff;
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
        padding-bottom: var(--container-gap);
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
    }
    tbody tr:hover {
        background-color: rgba(235, 235, 235, 0.75);
        cursor: pointer;
    }
    tr {
        /* display: block; */
        width: 100%;
    }
    thead td {
        text-align: center;
    }
    tbody td {
        text-align: right;
    }
    thead, tbody 
    { 
        /* display: block;  */
    }
    tbody {
        min-height: 100px;
        max-height: 238px;
        overflow-y: auto;
        overflow-x: hidden; 
    }
</style>