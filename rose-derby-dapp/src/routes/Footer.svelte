<script lang="ts">
    import { Events } from "$lib/Models";
    import { roseDerbyContractUnsigned } from "$lib/Stores";
    import { ethers } from "ethers";

    let totalWon: number = 0;

    const refreshTotalWon = () => {
        $roseDerbyContractUnsigned?.totalWon()
        .then(amount => {
            totalWon = amount;
            console.log("total won updated: ", totalWon);
        })
        .catch(console.log); 
    }

    //is this a memory leak if contract destroyed? yes it seems to leak subscribers..
    $: $roseDerbyContractUnsigned?.on(Events.RaceResultsDetermined, (index: number, results: any[]) => {
        refreshTotalWon();
    });

    $: $roseDerbyContractUnsigned && refreshTotalWon();
</script>

<footer>
    <p>Total won by all bettors: {ethers.formatEther(totalWon)} ROSE</p>
</footer>

<style>
    p {
        text-align: center;
    }
</style>