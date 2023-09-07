<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";

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
    <button {disabled}>Determine Results</button>
    <TransactionPending {tx} />
</form>


