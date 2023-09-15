# Rose Derby

A horse race betting dApp built for the Oasis Privacy4Web3 Hackathon.

## Description

A brief but informative overview of your project. Explain its purpose, features, and why it exists.

Rose Derby is a horse betting "game", similar to real-world horse betting, except with simulated races using Oasis Sapphire RNG to determine the race results.  What makes it interesting is that the participants are all completely private but the statistics and game activity is public, so it's obvious people are playing (and winning), but no one knows _who_ is playing.  

Players are incentivized to schedule and find participants for races by setting a % organizer "take" which awards them a percentage of the total betting pool on a race.  Then once the betting window has ended, players are then further incentivized to call the "determine race results" function to compute the results with Sapphire RNG and receive an additional percentage of the pool.

The contract owner receives a fixed 2% of every pool, and also receives any winnings for races in which no bettor wins.

## Table of Contents

- [Project Title](#rose-derby)
- [Description](#description)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  -[Incentives](#incentives)
  -[Anonymity](#anonymity)
- [License](#license)

## Getting Started

Explain how to get the project up and running. Include detailed instructions on prerequisites and installation.

To build and deploy this project for yourself, you'll need to first deploy the Rose Derby solidity contract, then use the deployment address and output ABI within the Svelte frontend.

### Prerequisites

- Metamask
- NodeJS

The dapp is currently built assuming users have the Metamask Web3 Wallet extension and has not been tested with other wallets.

NodeJS with npm is used for project dependencies.

### Installation

Provide step-by-step instructions on how to install your project. You can use code blocks to show commands or configurations.

From the project root use npm to install dependencies.

`npm install`

Add a .env file to the project root with a single entry `SAPPHIRE_TESTNET_PRIVATE_KEYS` and add at least 1 private key that will be used for deploying the contract to Oasis Sapphire Testnet.

Use hardhat commands to compile the solidity contracts via:

`npx hardhat compile`

Run unit tests against the hardhat network, use:

`npx hardhat test` or `npx hardhat coverage`

To deploy the contract, ensure that the private key account added to the .env file has some Sapphire TEST tokens (can be acquired from the [faucet](https://faucet.testnet.oasis.dev/)) and run the following script via harhdat:

`npx hardhat run scripts/deploy.ts --network sapphire_testnet`

The output from that script will display the address of the deployed contract.  In order to use the contract in the frontend, copy that address and add it as the value of the the `RoseDerby` JSON key inside `~\rose-derby-dapp\src\lib\contracts\contract-address.json` 
like `{ "RoseDerby": "{{put contract address here}}" }`

Then copy the output JSON ABI file from `~\artifacts\contracts\RoseDerby.sol\RoseDerby.json` and place it in the `~\rose-derby-dapp\src\lib\contracts\` folder, overwritting the existing file.  You'll need to do this any time you make changes to the contract.

To prepare and start the SvelteKit frontend, change to the front end folder `rose-derby-dapp`, use npm to install dependencies and start the vite hotloader.

`cd rose-derby-dapp`

`npm install`

`run dev -- --open`

## Usage

With the dapp running locally in a browser with Metamask installed, you may create races, bet on them, and determine the results.  

Use the refresh and withdraw buttons at the top winnings panel to check and withdraw winnings or to withdraw awarded incentives.  

Note: The refresh and withdraw feature require a signature as they use `msg.sender` in the contract function.

### Incentives 

The dapp's incentive system encourages players to schedule and promote their own races in order to increase their organizer % take.  Get as many players as you can to bet on your races, and use a large caller incentive % to encourage others to run the results transaction.

### Anonymity

By using Oasis Sapphire, the contract's design provides anonymity to players, as well as the contract owner.  

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

