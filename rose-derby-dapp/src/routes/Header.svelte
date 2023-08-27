<script>
    import logo from "$lib/images/rose-derby-logo.png";
    import WalletConnection from "./WalletConnection.svelte";
</script>

<nav>
    <a href="/">
        <img src={logo} alt="Rose Derby Logo" height="128px" width="128" />
    </a>

    Rose Derby
    
    <WalletConnection class="wallet-connect" />
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