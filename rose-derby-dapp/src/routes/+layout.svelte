<script>
    import "../app.css";
    import WalletConnection from "$lib/WalletConnection.svelte";
    import ThreeHorses from "$lib/images/ThreeHorses.svelte";
    import Winnings from '$lib/Winnings.svelte';
</script>

<nav>
    <a href="/">
        <ThreeHorses />
    </a>
    <div>
        <Winnings />
        <WalletConnection />
    </div>
</nav>

<main>
    <slot></slot>
</main>

<style>
    nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--gap-1);
        padding: var(--space-2);
        margin-bottom: var(--space-4);
    }
    div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--container-gap);
    }
    main {
        max-width: 500px;
        margin: 0 auto;
    }
    a :global(svg) {
        fill: var(--theme-color-rose);
    }
    a :global(svg:hover) {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
</style>
