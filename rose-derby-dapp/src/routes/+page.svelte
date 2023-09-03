<script lang="ts">
    import CreateRace from './CreateRace.svelte';
</script>

<div class="container">
    <div class="create-race">
        <CreateRace />   
    </div>
    <div class="find-existing"></div>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        gap: var(--base-gap);
    }

    .create-race,
    .find-existing {
        border: 1px solid black;
        min-width: 200px;
    }
</style>