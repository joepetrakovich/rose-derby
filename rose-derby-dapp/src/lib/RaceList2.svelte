<script lang="ts">
    import { races } from "$lib/Stores";
    import { blockTimestampToDate } from "$lib/Utils";
    import { ethers } from "ethers";
</script>

<div>
    <span>Races</span>
    <ul>
        {#each $races as race, i}
            <li>
                <a href="/races/{i}">Race #: {i}:</a>
                Take: {race.take}%
                Caller Incentive: {race.callerIncentive}%
                Post Time: {blockTimestampToDate(race.postTime).toLocaleString()}
                Pool: {ethers.formatEther(race.pool)} ROSE
                Finished: {race.finished}
            </li>
        {/each}
    </ul>
</div>

<style>
    div {
        padding: var(--container-padding);
        border-radius: var(--container-radius);
        background-color: #fff;
    }
    div > span {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
</style>