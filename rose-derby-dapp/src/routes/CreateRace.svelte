<script lang="ts">
    import { OasisNetworkStatus } from "$lib/Models";
    import { oasisNetworkStatus, roseDerbyContract } from "$lib/Stores";

    let postTime: Date;
    let take: number;
    let callerIncentive: number;

    const today: string = new Date().toISOString().split("T")[0];

    let tx: Promise<any>;
    const handleCreateRace = () => {
        const postTimeSeconds = Math.floor(new Date(postTime).getTime() / 1000);
        $roseDerbyContract?.scheduleRace(postTimeSeconds, take, callerIncentive, { gasLimit: 400000 })
        .then(transaction => {
            console.log("sent tx: ", transaction);
            tx = transaction.wait();
        })
        .catch(console.log);
    }
</script>

<div class="container">
    <div class="field">
        <label for="postTime">Post Time:</label>
        <input id="postTime" type="date" min={today} bind:value={postTime}  />
    </div>
    <div class="field">
        <label for="take">Take:</label>
        <input id="take" type="number" min=0 max=100 bind:value={take} />
    </div>
    <div class="field">
        <label for="callerIncentive">Caller Incentive:</label>
        <input id="callerIncentive" type="number" min=0 max=100 bind:value={callerIncentive} />
    </div>
    <button disabled={!postTime || $oasisNetworkStatus != OasisNetworkStatus.ON_SAPPHIRE_PARATIME} on:click={handleCreateRace}>Create Race</button>
    {#await tx}<small>Transaction pending...</small>{/await}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
    }
    small {
        color: gray;
        font-style: italic;
    }
</style>