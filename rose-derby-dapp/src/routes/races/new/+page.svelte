<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";
    
    const today: string = new Date().toISOString().split("T")[0];

    let disabled: boolean;
    let tx: Promise<any>;
    let postTime: Date;
    let take: number = 0;
    let callerIncentive: number = 0;
    let submitting: boolean;
    
    $: disabled = submitting || !postTime || !$connectedToSapphire;
  
    const handleSubmit = (event: Event) => {
        submitting = true;
        $roseDerbyContract?.scheduleRace(Math.floor(new Date(postTime).getTime() / 1000), take, callerIncentive, { gasLimit: 10_000_000 })
            .then(transaction => {
                tx = transaction.wait();
                (event.target as HTMLFormElement).reset();
            })
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

<div>
    <span>Create Race</span>
    <form on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="postTime">Post Time</label>
            <input id="postTime" placeholder="Post Time" type="datetime-local" min={today} required bind:value={postTime}  />
        </div>
        <div>
            <label for="take">Take %</label>
            <input id="take" type="number" min=0 max=100 required bind:value={take} />
        </div>
        <div>
            <label for="callerIncentive">Caller Incentive %</label>
            <input id="callerIncentive" type="number" min=0 max=100 required bind:value={callerIncentive} />
        </div>
        <button {disabled}>Create Race</button>
    </form>
</div>
<TransactionPending {tx} />

<style>
    div {
        padding: var(--container-padding);
        border-radius: var(--container-radius);
        background-color: #fff;
    }
    form {
        display: flex;
        flex-direction: column;
        gap: var(--container-gap);
    }
    input {
        border-top: 0;
        border-left: 0;
        border-right: 0
    }
    form div {
        padding: unset;
        border-radius: unset;
        background-color: unset;
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }
    label {
        font-size: 0.8rem;
        color: gray;
    }
    input {
        font-size: 1.3rem;
    }
    div > span {
        font-weight: bold;
        display: block;
        padding-bottom: var(--container-padding);
    }
    button {
        background-color: var(--theme-color-rose);
        border: none;
        padding: var(--button-padding);
        color: #fff;
        border-radius: var(--button-radius);
        font-size: 1.1rem;
    }
    button:hover {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
    button:disabled {
        background-color: gray;
        color: rgb(218, 218, 218);
        cursor: default;
        filter: unset !important;
    }
</style>