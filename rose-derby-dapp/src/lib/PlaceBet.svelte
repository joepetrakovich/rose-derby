<script lang="ts">
    import { Horse } from "$lib/Models";
    import { connectedToSapphire, roseDerbyContract } from "$lib/Stores";
    import { ethers } from "ethers";
    import HorseIcon from "$lib/images/HorseIcon.svelte";
    import { createEventDispatcher } from "svelte";
    import ChaChingSound from "$lib/sounds/cha-ching.mp3"

    export let index: number;
    export let tx: Promise<any>;

    const horses = Object.keys(Horse).filter((v) => isNaN(Number(v)));
    const dispatch = createEventDispatcher();

    let selectedHorse: Horse;
    let betAmount: number;
    let submitting: boolean;
    $: disabled = submitting || !$connectedToSapphire;
  
    async function waitForConfirmation(transaction: any) {
        try {
            await transaction.wait();
        } catch(error) {
            console.log(error);
        }
        dispatch('bet-placed');
        new Audio(ChaChingSound).play();
    }

    const handleSubmit = (event: Event) => {
        submitting = true;
        const betAmountInWei: BigInt = ethers.parseEther(betAmount.toString());
        $roseDerbyContract
            ?.placeBet(index, Horse[selectedHorse], { gasLimit: 10_000_000, value: betAmountInWei })
            .then(receipt => {tx = waitForConfirmation(receipt); (event.target as HTMLFormElement).reset();})
            .catch(console.log)
            .finally(() => submitting = false)
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <span>Place Bet</span>
    <div>
        {#each horses as horse} 
            <input id={horse} type="radio" bind:group={selectedHorse} value={horse}>
            <label for={horse} class={horse.toLowerCase()}> 
                {horse}
                <HorseIcon />
            </label> 
        {/each}
    </div>

    <span>Bet Amount</span> 
    <input type="number" min="2" required bind:value={betAmount} placeholder="(min. 2 ROSE)" />
    
    <button {disabled}>Place Bet</button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        background-color: var(--theme-color-pale-green);
        padding: var(--container-padding);
        border-radius: var(--container-radius);
    }
    form > span {
        margin: 0 0 var(--space-2) 0;
        color: gray;
    }
    div {
        display: flex;
        justify-content: space-around;
        margin-bottom: var(--space-2);
        flex-wrap: wrap;
    }
    label {
        padding: 2px 10px 2px 2px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer
    }
    [type=radio] {
        display: none;
    }
    [type=radio]:checked + label {
         background-color: white;
         border-radius: var(--container-radius);
    }
    [type=number] {
        border-top: 0;
        border-left: 0;
        border-right: 0;
        font-size: 1.3rem;
        background-color: var(--theme-color-pale-green);
        margin-bottom: var(--space-2);
    }
    button {
        background-color: var(--theme-color-rose);
        border: none;
        padding: var(--button-padding);
        color: #fff;
        border-radius: var(--button-radius);
        font-size: 1.1rem;
    }
    button:hover {
        cursor: pointer;
        filter: brightness(var(--hover-brightness));
    }
    button:disabled {
        background-color: gray;
        color: rgb(218, 218, 218);
        cursor: default;
        filter: unset !important;
    }
</style>
