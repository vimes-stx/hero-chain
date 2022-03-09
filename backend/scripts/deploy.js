// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled  
  //await hre.run('compile');

  var statDistribution = [1, 2, 3];
  var weightDistribution = [2, 3, 1];

  const heroChainFactory = await hre.ethers.getContractFactory("HeroChain");
  const heroChain = await heroChainFactory.deploy(
    statDistribution, weightDistribution, statDistribution, 
    weightDistribution, statDistribution, weightDistribution);
  console.log("Deployed hero chain main contract to ", heroChain.address);

  const basicRendererFactory = await hre.ethers.getContractFactory("BasicRenderer");
  const basicRenderer = await basicRendererFactory.deploy(heroChain.address);
  console.log("Deployed basic renderer contract to ", basicRenderer.address);

  const unrevealedRendererFactory = await hre.ethers.getContractFactory("UnrevealedBasicRenderer");
  const unrevealedRenderer = await unrevealedRendererFactory.deploy();
  console.log("Deployed unrevealed renderer contract to ", unrevealedRenderer.address);

  await heroChain.setMetadataAddresses(basicRenderer.address, unrevealedRenderer.address);
  console.log("Set renderer metadata address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});