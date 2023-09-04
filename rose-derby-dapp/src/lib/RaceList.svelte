<script lang="ts">
    import { type Race, Events } from "$lib/Models";
    import { roseDerbyContractUnsigned, lastKnownBlockTimestamp } from "$lib/Stores";
    import { blockTimestampToDate } from "$lib/Utils";
    import { ethers } from "ethers";

    let currentRaces: Race[] = [];

    const handleRefreshRaces = () => {
        $roseDerbyContractUnsigned?.getRaces()
        .then(races => {
            currentRaces = races;
        })
        .catch(console.log); 
    }

    //is this a memory leak if contract destroyed? yes it seems to leak subscribers..
    $: $roseDerbyContractUnsigned?.on(Events.RaceScheduled, (index: number) => {
        console.log("Race %d scheduled", index);
        handleRefreshRaces();
    });

    //why did 6 events come from this
    $: $roseDerbyContractUnsigned?.on(Events.BetPlaced, (index: number, horse: number, value: string) => {
        console.log("Bet placed on race %d, horse %d, amount %s", index, horse, value);
        handleRefreshRaces();
    });

    $: $roseDerbyContractUnsigned?.on(Events.RaceResultsDetermined, (index: number, results: any[]) => {
        console.log("Results determined on race %d", index);
        console.log(results)
        // for (let i = 0; i < results.length; i++) {
        //     console.log(results[i]);
        // }
        handleRefreshRaces();
    });

    $: $roseDerbyContractUnsigned && handleRefreshRaces();
</script>

<div>
    {$lastKnownBlockTimestamp?.toLocaleString()}

    Races:
    <button on:click={handleRefreshRaces}>Refresh Races</button>
    <ul>
        {#each currentRaces as race, i}
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