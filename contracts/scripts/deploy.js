import hre from "hardhat";

async function main() {
  const Identity = await hre.ethers.getContractFactory("Identity");
  const identity = await Identity.deploy();

  await identity.waitForDeployment();

  console.log(`Identity contract deployed to ${await identity.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
