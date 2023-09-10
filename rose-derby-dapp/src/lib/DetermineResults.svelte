<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";
    import FlagIcon from "./images/FlagIcon.svelte";

    export let index: number;

    let submitting: boolean;
    $: disabled = submitting || !$connectedToSapphire;
  
    let tx: Promise<any>;
    const handleSubmit = (event: Event) => {
        submitting = true;
        $roseDerbyContract
            ?.determineResults(index, { gasLimit: 10_000_000 })
            .then(transaction => {
                tx = transaction.wait();
                (event.target as HTMLFormElement).reset();
            })
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <button {disabled}>
        Determine Results
        <FlagIcon />
    </button>
    <TransactionPending {tx} />
</form>

<style>
    form {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    button {
        flex-grow: 1;
        font-size: 1.1rem;
        background-color: green;
        border: none;
        padding: var(--button-padding);
        color: #fff;
        border-radius: var(--button-radius);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--space-1);
    }
    button:hover {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
</style>
