<script lang="ts">
    import "../app.css";
    import WalletConnection from "$lib/WalletConnection.svelte";
    import ThreeHorses from "$lib/images/ThreeHorses.svelte";
    import Winnings from '$lib/Winnings.svelte';
    import GithubIcon from "$lib/images/GithubIcon.svelte";
    import ConeIcon from "$lib/images/ConeIcon.svelte";
    import { onMount } from "svelte";
    import { useMediaQuery } from "$lib/Stores";
    import type { Readable } from "svelte/store";

    let atLeast500pxWide: Readable<boolean>;
    let atLeast700pxWide: Readable<boolean>;
    
    onMount(() => {
        atLeast500pxWide = useMediaQuery("(min-width: 500px)");
        atLeast700pxWide = useMediaQuery("(min-width: 700px)");
    })
</script>

<nav>
    <div>
        <a href="/">
            <ThreeHorses />
        </a>
        <div>
            {#if $atLeast500pxWide}
                <Winnings />
            {/if}
            <WalletConnection showAddress={$atLeast700pxWide}  />
        </div>
    </div>
    <div>
        {#if !$atLeast500pxWide}
            <Winnings />
        {:else}
            <a href="https://github.com/joepetrakovich/rose-derby">
                <GithubIcon width="24" height="24" />
            </a>
            <a title="This dApp is on Testnet and does not use real ROSE.  Click here to get TEST tokens." href="https://faucet.testnet.oasis.dev/">
                <ConeIcon width="16" height="16" /> Testnet
            </a>
        {/if}
    </div>
</nav>

<main>
    <slot></slot>
</main>

<footer>
    <a href="https://github.com/joepetrakovich/rose-derby">
        <GithubIcon />
    </a>
    <a href="https://faucet.testnet.oasis.dev/">
        <ConeIcon /> <span>Testnet Faucet</span>
    </a>
</footer>

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
        gap: var(--space-1);
        padding: var(--space-2);
    }
    nav > div:nth-child(2) {
        display: flex;
        justify-content: end;
        align-items: center;
        gap: var(--space-2);
    }
    nav > div:nth-child(2) a:nth-child(2) {
        background-color: rgb(255, 183, 0);
        display: flex;
        align-items: center;
        border-radius: 14px;
        padding: var(--space-1) var(--space-2);
        text-decoration: none;
        color: black;
    }
    nav > div:nth-child(2) a :global(svg) {
        fill: black;
    }
     nav > div > div {
        display: flex;
        align-items: center;
        gap: var(--space-3);
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
    footer {
        display: flex;
        gap: var(--space-2);
        align-items: center;
        justify-content: end;
        margin: var(--container-padding) 0;
    }
    footer a {
        display: flex;
        align-items: center;
        gap: var(--space-1);
    }
</style>
