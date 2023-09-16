<script lang="ts">
    export let tx: Promise<any>;
</script>

{#await tx}<small><i></i>Transaction pending...</small>{/await}

<style>
    small {
        color: var(--theme-color-rose);
        font-style: italic;
        display: flex;
        gap: var(--space-2);
        align-items: center;
        margin-top: 16px;
        position: absolute;
    }
    i {
        height: 10px;
        width: 10px;
        border-radius: 14px;
        background-color: var(--theme-color-rose);
        animation: flash linear 1.25s infinite;
        display: inline-block;
        box-shadow: 0px 0px 4px 0px;
    }
</style>