<script lang="ts">
    export let tx: Promise<any>;
</script>

{#await tx}<small>Transaction pending...</small>{/await}

<style>
    small {
        color: gray;
        font-style: italic;
        display: block;
        margin-top: 8px;
        animation: flash linear 2s infinite;
    }
</style>