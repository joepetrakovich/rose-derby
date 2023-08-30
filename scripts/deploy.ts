import { ethers } from "hardhat";

async function main() {
  const RoseDerby = await ethers.getContractFactory("RoseDerby");
  const roseDerby = await RoseDerby.deploy();
  await roseDerby.waitForDeployment();
  console.log(`Rose Derby deployed to ${await roseDerby.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});