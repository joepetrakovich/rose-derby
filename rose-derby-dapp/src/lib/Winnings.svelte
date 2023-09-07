<script lang="ts">
    import TrophyIcon from "$lib/images/TrophyIcon.svelte";
    import { roseDerbyContract } from "./Stores";
    import formatEther from "./Utils";
    import RefreshIcon from "./images/RefreshIcon.svelte";
    import WithdrawIcon from "./images/WithdrawIcon.svelte";
    
    let amount: bigint = 0n;
    let refreshing: boolean;
    let withdrawing: boolean;

    const handleRefreshWinnings = () => {
        if (!$roseDerbyContract) return;

        refreshing = true;
        $roseDerbyContract
            .getWinningsBalance({ gasLimit: 10_000_000 })
            .then(balance => amount = balance)
            .catch(console.log)
            .finally(() => refreshing = false);
    }

    const handleWithdraw = () => {
        if (!$roseDerbyContract) return;

        withdrawing = true;
        $roseDerbyContract
            .withdraw({ gasLimit: 10_000_000 })
            .then(transaction => transaction.wait())
            .then(() => amount = 0n)
            .catch(console.log)
            .finally(() => withdrawing = false);
    }
</script>

<div>
    <span title="Winnings"><TrophyIcon height={16} width={16} filled={true} /></span>
    <span>{formatEther(amount, 0)} ROSE</span>
    <span>
        <button class:refreshing on:click={handleRefreshWinnings} title="Refresh Winnings"><RefreshIcon /></button>
        <button class:withdrawing on:click={handleWithdraw} title="Withdraw"><WithdrawIcon /></button>
    </span>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        justify-content: space-evenly;
        border: 3px solid white;
        border-radius: 16px;
        background-color: var(--theme-color-pale-green);
        padding: var(--space-1) var(--container-padding);
    }
    span {
        display: flex;
        align-items: center;
        gap: var(--space-1);
    }
    .refreshing, .withdrawing {
        animation: flash linear 2s infinite;
    }
    button {
        background: none;
        border: 0;
        padding: 0;
    }
    span > :global(svg) {
        fill: var(--theme-color-light-brown);
        stroke: black;
        stroke-width: 1;
    }
    button:first-child :global(svg) {
        vertical-align: bottom;
    }
    button :global(svg) {
        fill: var(--theme-color-rose);
    }
    button :global(svg:hover) {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
</style>

