<script lang="ts">
    import { Jazzicon } from 'ethers-svelte/components';
    import { truncateWithCenterEllipses } from "$lib/Utils";
    import { signerAddress } from '$lib/Stores';
    import TrophyIcon from './images/TrophyIcon.svelte';

</script>


<!-- <TrophyIcon /> -->
<span title="Current Address: {$signerAddress}">
    <Jazzicon address="{$signerAddress}" size={32} />
    <!-- {truncateWithCenterEllipses($signerAddress, 13)} -->
</span>    

    <!-- flex col on mobile, flex row on wide-->
    <!-- <span>Winnings</span> -->
    <!-- testnet badge, get test tokens badge-->

