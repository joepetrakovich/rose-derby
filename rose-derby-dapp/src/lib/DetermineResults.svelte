<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import { createEventDispatcher } from "svelte";
    import FlagIcon from "$lib/images/FlagIcon.svelte";
    import SuccessSound from "$lib/sounds/success.mp3"

    export let index: number;
    export let tx: Promise<any>;

    const dispatch = createEventDispatcher();

    let submitting: boolean;
    $: disabled = submitting || !$connectedToSapphire;

    async function waitForConfirmation(transaction: any) {
        try {
            await transaction.wait();
        } catch(error) {
            console.log(error);
        }
        dispatch('results-determined');
        new Audio(SuccessSound).play();
        submitting = false
    }
  
    const handleSubmit = (event: Event) => {
        submitting = true;
        $roseDerbyContract
            ?.determineResults(index, { gasLimit: 10_000_000 })
            .then(receipt => {tx = waitForConfirmation(receipt); (event.target as HTMLFormElement).reset();})
            .catch(console.log);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <button {disabled}>
        Determine Results
        <FlagIcon />
    </button>
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
    button:disabled {
        background-color: gray;
        color: rgb(218, 218, 218);
        cursor: default;
        filter: unset !important;
    }
</style>
