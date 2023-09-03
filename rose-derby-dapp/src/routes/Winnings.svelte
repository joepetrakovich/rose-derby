<script lang="ts">
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import TransactionPending from "$lib/TransactionPending.svelte";

    let winnings: Number = 0;
    let tx: Promise<any>;
    let submitting: boolean;
    $: disabled = submitting || !$connectedToSapphire;
  
    const handleRefreshWinnings = async () => {
        $roseDerbyContract?.getWinningsBalance()
            .then(amount => {winnings = amount; console.log("latest winnings: %d", amount);})
            .catch(error => console.log(error));
    }

    const handleWithdraw = async () => {
        submitting = true;
        $roseDerbyContract?.withdraw({gasLimit: 400000 })
            .then(transaction => {
                tx = transaction.wait();
            })
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

Winnings: {winnings} ROSE 
<button {disabled} on:click={handleWithdraw}>Withdraw</button>
<TransactionPending {tx} />
<button on:click={handleRefreshWinnings}>Refresh</button>


