<script>
    import Header from "./Header.svelte";
</script>

<Header />

<slot></slot>

<style>
    :global(html) {
        font-size: 16px;
        font-weight: bold;
        font-family: sans-serif;

        --base-gap: 8px;
        --gap-2x: 16px;
    }
</style>