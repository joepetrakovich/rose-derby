<script lang="ts">
    import { Horse } from "$lib/Models";
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";
    import { ethers } from "ethers";

    export let index: number;

    const horses = Object.keys(Horse).filter((v) => isNaN(Number(v)));

    let horse: number;
    let betAmount: number;
    let submitting: boolean;
    $: disabled = submitting || !$connectedToSapphire;
  
    let tx: Promise<any>;
    const handleSubmit = (event: Event) => {
        submitting = true;
        const betAmountInWei: BigInt = ethers.parseEther(betAmount.toString());
        console.log("betting %d ether", betAmountInWei);
        $roseDerbyContract
            ?.placeBet(index, horse, { gasLimit: 400000, value: betAmountInWei })
            .then(transaction => {
                tx = transaction.wait();
                (event.target as HTMLFormElement).reset();
            })
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    Bet Amount (minimum 2 ROSE): 
    <input type="number" min="2" required bind:value={betAmount} />
    <select required bind:value={horse}>
        {#each horses as horse, i}
            <option value={i}>{horse}</option>
        {/each}
    </select>
    <button {disabled}>Place Bet</button>
    <TransactionPending {tx} />
</form>


