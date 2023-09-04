<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";

    let postTime: Date;
    let take: number = 0;
    let callerIncentive: number = 0;
    let submitting: boolean;
    $: disabled = submitting || !postTime || !$connectedToSapphire;
  
    const today: string = new Date().toISOString().split("T")[0];

    let tx: Promise<any>;
    const handleSubmit = (event: Event) => {
        submitting = true;
        $roseDerbyContract
            ?.scheduleRace(Math.floor(new Date(postTime).getTime() / 1000), take, callerIncentive, { gasLimit: 400000 })
            .then(transaction => {
                tx = transaction.wait();
                (event.target as HTMLFormElement).reset();
            })
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="field">
        <label for="postTime">Post Time:</label>
        <input id="postTime" placeholder="Post Time" type="datetime-local" min={today} required bind:value={postTime}  />
    </div>
    <div class="field">
        <label for="take">Take:</label>
        <input id="take" type="number" min=0 max=100 required bind:value={take} />
    </div>
    <div class="field">
        <label for="callerIncentive">Caller Incentive:</label>
        <input id="callerIncentive" type="number" min=0 max=100 required bind:value={callerIncentive} />
    </div>
    <button {disabled}>Create Race</button>
    <TransactionPending {tx} />
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }
    .field {
        display: flex;
    }
    .field label, .field input {
        width: 50%;
    }
</style>