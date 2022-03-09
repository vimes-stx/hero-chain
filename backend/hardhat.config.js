const { task } = require("hardhat/config");

require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("solidity-coverage");

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("set-claimable", "Set Hero Chain claimable")
  .addParam("mainAddress", "HeroChain contract address")
  .setAction(async (taskArgs) => {
    const heroChainFactory = await ethers.getContractFactory("HeroChain");
    const heroChainInstance = await heroChainFactory.attach(taskArgs.mainAddress);
    console.log("Attached to contract");
    await heroChainInstance.setClaimable(true);
    console.log("Set claimable to true");
});

task("mint-one", "Mint one")
  .addParam("mainAddress", "Mint one for testing")
  .setAction(async (taskArgs) => {
    const heroChainFactory = await ethers.getContractFactory("HeroChain");
    const heroChainInstance = await heroChainFactory.attach(taskArgs.mainAddress);
    console.log("Attached to contract");
    await heroChainInstance.mint();
    console.log("Minted one");
});

task("reveal-heroes", "Reveal heroes")
  .addParam("mainAddress", "HeroChain contract address")
  .setAction(async (taskArgs) => {
    const heroChainFactory = await ethers.getContractFactory("HeroChain");
    const heroChainInstance = await heroChainFactory.attach(taskArgs.mainAddress);
    console.log("Attached to contract");
    await heroChainInstance.reveal();
    console.log("Revealed currently minted heroes");
});

task("set-metadata-address", "Set the metadata address on deployed Corruptions contract")
  .addParam("mainAddress", "Corruptions contract address")
  .addParam("metadataAddress", "Metadata contract address")
  .setAction(async (taskArgs) => {
      
    const deployedCorruptionsContract = taskArgs.mainAddress;//0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    const metadataContract = taskArgs.metadataAddress;//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

    const CorruptionsFactory = await ethers.getContractFactory("Corruptions");
    const deployedContract = await CorruptionsFactory.attach(deployedCorruptionsContract);
    console.log("Attached to deployed contract ", deployedContract.address);

    deployedContract.setMetadataAddress(metadataContract);
    const metadataAddress = await deployedContract.metadataAddress();
    console.log("Got metadata address: ", metadataAddress);
  });

// task("mint-one", "Mint a token")
//   .addParam("mainAddress", "Corruptions contract address")
//   .setAction(async (taskArgs) => {
//     const deployedCorruptionsContract = taskArgs.mainAddress;
//     const CorruptionsFactory = await ethers.getContractFactory("Corruptions");
//     const deployedContract = await CorruptionsFactory.attach(deployedCorruptionsContract);
//     console.log("Attached to deployed contract ", deployedContract.address);

//     const metadataAddress = await deployedContract.metadataAddress();
//     console.log("Got metadata address ", metadataAddress);

//     const tokenId = await deployedContract.EXPERIMENTAL_UNAUDITED_NO_ROADMAP_ABSOLUTELY_NO_PROMISES_BUT_I_ACKNOWLEDGE_AND_WANT_TO_MINT_ANYWAY
//       ({value: ethers.utils.parseEther("0.08")});
//     console.log("Got token id ", tokenId);
//   });

task("examine-token", "Examine a token")
  .addParam("mainAddress", "Corruptions contract address")
  .addParam("tokenId", "Token id")
  .setAction(async (taskArgs) => {    
    const deployedCorruptionsContract = taskArgs.mainAddress;
    const CorruptionsFactory = await ethers.getContractFactory("Corruptions");
    const deployedContract = await CorruptionsFactory.attach(deployedCorruptionsContract);
    console.log("Attached to deployed contract ", deployedContract.address);

    const data = await deployedContract.tokenURI(taskArgs.tokenId);
    console.log("Got token uri: ", data);
  });

task("set-metadata-address-and-mint", "Set the metadata address on deployed Corruptions contract")
  .addParam("mainAddress", "Corruptions contract address")
  .addParam("metadataAddress", "Metadata contract address")
  .setAction(async (taskArgs) => {
      
    const deployedCorruptionsContract = taskArgs.mainAddress;//0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    const metadataContract = taskArgs.metadataAddress;//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

    const CorruptionsFactory = await ethers.getContractFactory("Corruptions");
    const deployedContract = await CorruptionsFactory.attach(deployedCorruptionsContract);
    console.log("Attached to deployed contract ", deployedContract.address);

    deployedContract.setMetadataAddress(metadataContract);
    const metadataAddress = await deployedContract.metadataAddress();
    console.log("Got metadata address: ", metadataAddress);

    const tokenId = await deployedContract.EXPERIMENTAL_UNAUDITED_NO_ROADMAP_ABSOLUTELY_NO_PROMISES_BUT_I_ACKNOWLEDGE_AND_WANT_TO_MINT_ANYWAY
      ({value: ethers.utils.parseEther("0.08")});
    console.log("Got token id ", tokenId);

    const data = await deployedContract.tokenURI(0);
    console.log("Got token uri: ", data);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`]
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    url: "https://rinkeby.etherscan.io",
    apiKey: ETHERSCAN_API_KEY
  }
};
