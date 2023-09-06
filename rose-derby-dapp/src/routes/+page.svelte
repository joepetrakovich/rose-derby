<script>
    import RaceList from '$lib/RaceList.svelte';
    import Stats from '$lib/Stats.svelte';
</script>

<div>
    <Stats />
    <RaceList />
</div>

<style>
    div { 
        display: flex;
        flex-direction: column;
        gap: var(--container-gap);
    }
</style>