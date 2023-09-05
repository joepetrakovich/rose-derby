<script>
    import RaceList2 from '$lib/RaceList2.svelte';
    import Stats from '$lib/Stats.svelte';
</script>

<div>
    <Stats />
    <RaceList2 />
</div>

<style>
    div { 
        display: flex;
        flex-direction: column;
        gap: var(--container-gap);
    }
</style>