<script lang="ts">
    import horses from "$lib/images/horses.svg";
    import WalletConnection from "./WalletConnection.svelte";
    import { roseDerbyContract } from "$lib/Stores";

    let winnings: Number = 0;

    const handleRefreshWinnings = async () => {
        $roseDerbyContract?.getWinningsBalance()
            .then(amount => {winnings = amount; console.log("latest winnings: %d", amount);})
            .catch(error => console.log(error));
    }
</script>

<nav>
    <a href="/"> Rose Derby <img src={horses} alt="Three horses" /></a>
    <WalletConnection class="wallet-connect" />
    Winnings: {winnings} <button on:click={handleRefreshWinnings}>Refresh</button>
</nav>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.2rem;
    }

    a, :global(.wallet-connect) {
        width: 170px;
    }
</style>