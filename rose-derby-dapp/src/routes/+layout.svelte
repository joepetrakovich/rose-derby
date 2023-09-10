<script>
    import "../app.css";
    import WalletConnection from "$lib/WalletConnection.svelte";
    import ThreeHorses from "$lib/images/ThreeHorses.svelte";
    import Winnings from '$lib/Winnings.svelte';
</script>

<nav>
    <div>
        <a href="/">
            <ThreeHorses />
        </a>
        <div>
            <WalletConnection />
        </div>
    </div>
    <div>
        <Winnings />
    </div>
</nav>

<main>
    <slot></slot>
</main>

<style>
    nav {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--space-4);
    }
    nav > div:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--gap-1);
        padding: var(--space-2);
    }
    nav > div:nth-child(2) {
        display: flex;
        justify-content: end;
    }
    /* nav > div {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        justify-content: space-between;
        gap: var(--container-gap);
    }
    span {
  
    } */
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
