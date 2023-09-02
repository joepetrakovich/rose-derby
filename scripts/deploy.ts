import { ethers } from "hardhat";
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log( "Deloying the contracts with the account:", await deployer.getAddress());

  const RoseDerby = await ethers.getContractFactory("RoseDerby");
  const roseDerby = await RoseDerby.deploy();
  await roseDerby.waitForDeployment();

  console.log(`Rose Derby deployed to ${await roseDerby.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});