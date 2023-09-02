<script lang="ts">
    import { roseDerbyContractUnsigned } from "$lib/Stores";

    //TODO: should be able to use the types from hardhat
    let currentRaces: any[] = [];

    const handleRefreshRaces = () => {
        $roseDerbyContractUnsigned?.getRaces()
        .then(races => {
            console.log(races);
            currentRaces = races;
        })
        .catch(console.log); 
    }

    $: $roseDerbyContractUnsigned && handleRefreshRaces();
</script>

Races:
<button on:click={handleRefreshRaces}>Refresh Races</button>
<ul>
    {#each currentRaces as race, i}
        <li>
            Race #: {i}:
            Take: {race.take} 
            Caller Incentive: {race.callerIncentive}
            Post Time: {race.postTime}
            Pool: {race.pool}
            Finished: {race.finished}
        </li>
    {/each}
</ul>