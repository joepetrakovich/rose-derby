<script lang="ts">
    import Winnings from './Winnings.svelte';
    import horses from "$lib/images/horses.svg";
    import WalletConnection from "./WalletConnection.svelte";
</script>

<nav>
    <a href="/"> Rose Derby <img src={horses} alt="Three horses" /></a>
    <span>
        <WalletConnection class="wallet-connect" />
        <Winnings />
    </span>
</nav>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.2rem;
    }
    a, span {
        display: flex;
        gap: var(--base-gap);
        align-items: center;
    }
</style>