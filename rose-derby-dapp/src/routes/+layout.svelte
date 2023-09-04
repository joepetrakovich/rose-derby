<script>
    import "../app.css";
    import horses from "$lib/images/horses.svg";
    import WalletConnection from "$lib/WalletConnection.svelte";
</script>

<nav>
    <a href="/">
        <img src={horses} alt="Three horses" />
    </a>
    <WalletConnection />
</nav>

<slot />

<style>
    nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--gap-1);
    }
</style>
