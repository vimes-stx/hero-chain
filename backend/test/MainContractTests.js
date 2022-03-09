const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");

var heroChainFactory;
var heroChainInstance;
var unrevealedRendererFactory;
var unrevealedRendererInstance;
var revealedRendererFactory;
var revealedRendererInstance;
var basicRendererFactory;
var basicRendererInstance;
var unrevealedBasicRendererFactory;
var unrevealedBasicRendererInstance;

var totalMintCount = 6;
var statDistribution = [1, 2, 3];
var weightDistribution = [2, 3, 1];
var badWeightDistribution = [1, 3, 1];

beforeEach("Hero chain setup", async function() {
  console.log("Setting up tests");
  heroChainFactory = await ethers.getContractFactory("HeroChain");
  heroChainInstance = await heroChainFactory.deploy(
    statDistribution, weightDistribution, statDistribution, 
    weightDistribution, statDistribution, weightDistribution);

  unrevealedRendererFactory = await ethers.getContractFactory("UnrevealedRendererMock");
  unrevealedRendererInstance = await unrevealedRendererFactory.deploy();

  revealedRendererFactory = await ethers.getContractFactory("RevealedRendererMock");
  revealedRendererInstance = await revealedRendererFactory.deploy();

  basicRendererFactory = await ethers.getContractFactory("BasicRenderer");
  basicRendererInstance = await basicRendererFactory.deploy(heroChainInstance.address);

  unrevealedBasicRendererFactory = await ethers.getContractFactory("UnrevealedBasicRenderer");
  unrevealedBasicRendererInstance = await unrevealedBasicRendererFactory.deploy();
});

// describe("Metadata Output", function () {
//   it("Test what is drawn for various ID's", async function () {
//     const Metadata = await ethers.getContractFactory("CorruptionsMetadata");
//     const metadata = await Metadata.deploy();
//     await metadata.deployed();

//     console.log('Deployed metadata to ', metadata.address);
//     //console.log(atob(await metadata.draw(343, 180)));

//     const Corruption = await ethers.getContractFactory("Corruptions");
//     const corruptions = await Corruption.deploy();
//     await corruptions.deployed();
//     console.log('Deployued corruptions to ', corruptions.address);

//     const selfAddress = await ethers.getSigner();
//     console.log('Signer address ', selfAddress);

//     let [wallet] = waffle.provider.getWallets();
//     console.log('Wallet address ', wallet.address);

//     await corruptions.setMetadataAddress(metadata.address);

//     await corruptions.EXPERIMENTAL_UNAUDITED_NO_ROADMAP_ABSOLUTELY_NO_PROMISES_BUT_I_ACKNOWLEDGE_AND_WANT_TO_MINT_ANYWAY
//       ({value: ethers.utils.parseEther("0.08")});

//     //TODO: FIGURE OUT HOW TO TEST THIS FAIL STATE BEFORE APPLY ADDRESS
//     const firstToke = await corruptions.tokenURI(0);
//     console.log('First token ', firstToke);


//     // expect(await metadata.greet()).to.equal("Hello, world!");

//     // const setGreetingTx = await metadata.setGreeting("Hola, mundo!");

//     // // wait until the transaction is mined
//     // await setGreetingTx.wait();

//     // expect(await metadata.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("Random distribution tests", function() {

  it("Supply matches expected", async function() {
    const supply = await heroChainInstance.supply();
    const index = await heroChainInstance.currentRevealIndex();
    expect(supply === totalMintCount, "Ensure correct amount of supply made available");
    expect(index === 0);
  });

  it("Cannot mint one until set claimable", async function() {
    try {
      await heroChainInstance.mint();
      assert(false, "Should not be able to mint before setting claimable to true");
    } catch (err) {
      assert(err, "Mint attempt should fail prior to setting claimable true");
    }
  });

  it("Can mint after setting claimable", async function() {
    await heroChainInstance.setClaimable(true);
    let currentSupply = await heroChainInstance.totalSupply();
    let index = await heroChainInstance.currentRevealIndex();
    expect(currentSupply === 0, "Should not yet have one minted");
    expect(index === 0, "Reveal index should be 0");

    await heroChainInstance.mint();
    currentSupply = await heroChainInstance.totalSupply();
    index = await heroChainInstance.currentRevealIndex();
    expect(currentSupply === 1, "Should have one minted");
    expect(index === 0, "Reveal index should still be 0");
  });

  it("Can't mint more than supply", async function() {
    await heroChainInstance.setClaimable(true);
    for (var i = 0; i < totalMintCount; i++) {
      await heroChainInstance.mint();
    }
    const index = await heroChainInstance.currentRevealIndex();
    const currentSupply = await heroChainInstance.totalSupply();
    expect(currentSupply === 6, "Should have six minted");
    expect(index === 0, "Reveal index should still be 0");

    try {
      await heroChainInstance.mint();
      assert(false, "Should not be able to mint more than supply");
    } catch(err) {
      assert(err, "Should fail to mint more than supply");
    }
  });

  // it("Confirm maps are correctly created", async function() {
  //   const bodyValues = [3];
  //   for (var i = 0; i < 3; i++) {
  //     const test = await heroChainInstance.bodySet().values(i);
  //     console.log(test);
  //     bodyValues[i] = test.values[i];
  //   }
  //   assert(bodyValues[0] === 1, "First entry should be one");
  //   assert(bodyValues[1] === 2, "Second entry should be two");
  //   assert(bodyValues[2] === 3, "Third entry should be three");

  //   const mindValues = [3];
  //   for (var i = 0; i < 3; i++) mindValues[i] = await heroChainInstance.mindSet().values[i];
  //   assert(mindValues[0] === 1, "First entry should be one");
  //   assert(mindValues[1] === 2, "Second entry should be two");
  //   assert(mindValues[2] === 3, "Third entry should be three");

  //   const energyValues = [3];
  //   for (var i = 0; i < 3; i++) energyValues[i] = await heroChainInstance.energySet().values[i];
  //   assert(energyValues[0] === 1, "First entry should be one");
  //   assert(energyValues[1] === 2, "Second entry should be two");
  //   assert(energyValues[2] === 3, "Third entry should be three");

  //   assert(await heroChainInstance.bodyWeightMap(bodyValues[0]) === 2, "Should be two instances of stat 1");
  //   assert(await heroChainInstance.bodyWeightMap(bodyValues[1]) === 3, "Should be three instances of stat 2");
  //   assert(await heroChainInstance.bodyWeightMap(bodyValues[2]) === 1, "Should be one instance of stat 3");

  //   assert(await heroChainInstance.mindWeightMap(mindValues[0]) === 2, "Should be two instances of stat 1");
  //   assert(await heroChainInstance.mindWeightMap(mindValues[1]) === 3, "Should be three instances of stat 2");
  //   assert(await heroChainInstance.mindWeightMap(mindValues[2]) === 1, "Should be one instance of stat 3");

  //   assert(await heroChainInstance.energyWeightMap(energyValues[0]) === 2, "Should be two instances of stat 1");
  //   assert(await heroChainInstance.energyWeightMap(energyValues[1]) === 3, "Should be three instances of stat 2");
  //   assert(await heroChainInstance.energyWeightMap(energyValues[2]) === 1, "Should be one instance of stat 3");
  // });

  it("Confirm fail on different total count", async function() {
    try {
      heroChainFactory = await ethers.getContractFactory("HeroChain");
      const testInstance = await heroChainFactory.deploy(
        statDistribution, weightDistribution, statDistribution, 
        weightDistribution, statDistribution, badWeightDistribution);
      assert(false, "Should have failed to construct contract with mismatched weight counts");
    } catch(err) {
      assert(err, "Should have failed to construct contract with mismatched weight counts");
    }
  });

  it("Reveal asserts correct weight distribution", async function() {
    await heroChainInstance.setClaimable(true);
    for (var i = 0; i < totalMintCount; i++) {
      await heroChainInstance.mint();
    }
    
    let index = await heroChainInstance.currentRevealIndex();
    let currentSupply = await heroChainInstance.totalSupply();
    expect(currentSupply === 6, "Should have six minted");
    expect(index === 0, "Reveal index should still be 0");

    let bodyCount = [0, 0, 0];
    let mindCount = [0, 0, 0];
    let energyCount = [0, 0, 0];

    for (var i = 0; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      assert(currentStats.body === 0, "Should only be 0's pre-reveal");
      assert(currentStats.energy === 0, "Should only be 0's pre-reveal");
      assert(currentStats.mind === 0, "Should only be 0's pre-reveal");
    }

    await heroChainInstance.reveal();
    index = await heroChainInstance.currentRevealIndex();
    currentSupply = await heroChainInstance.totalSupply();
    expect(currentSupply === 6, "Should have six minted");
    expect(index === 6, "Reveal index should be 6 now that we've revealed all");

    for (var i = 0; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      console.log("Got current stats ", currentStats);
      bodyCount[(currentStats.body - 1)]++;
      mindCount[(currentStats.mind - 1)]++;
      energyCount[(currentStats.energy - 1)]++;
    }

    assert(bodyCount[0] === 2, "Should have 2 of stat 1 for body");
    assert(mindCount[0] === 2, "Should have 2 of stat 1 for mind");
    assert(energyCount[0] === 2, "Should have 2 of stat 1 for energy");
    assert(bodyCount[1] === 3, "Should have 3 of stat 2 for body");
    assert(mindCount[1] === 3, "Should have 3 of stat 2 for mind");
    assert(energyCount[1] === 3, "Should have 3 of stat 2 for energy");
    assert(bodyCount[2] === 1, "Should have 1 of stat 3 for body");
    assert(mindCount[2] === 1, "Should have 1 of stat 3 for mind");
    assert(energyCount[2] === 1, "Should have 1 of stat 3 for energy");
  });

  it("Reveal repeatedly over time", async function() {
    await heroChainInstance.setClaimable(true);
    for (var i = 0; i < 3; i++) {
      await heroChainInstance.mint();
    }
    
    let index = await heroChainInstance.currentRevealIndex();
    let currentSupply = await heroChainInstance.totalSupply();
    expect(currentSupply === 3, "Should have three minted");
    expect(index === 0, "Reveal index should still be 0");

    for (var i = 0; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      assert(currentStats.body === 0, "Should only be 0's pre-reveal");
      assert(currentStats.energy === 0, "Should only be 0's pre-reveal");
      assert(currentStats.mind === 0, "Should only be 0's pre-reveal");
    }

    await heroChainInstance.reveal();
    index = await heroChainInstance.currentRevealIndex();
    currentSupply = await heroChainInstance.totalSupply();
    expect(currentSupply === 3, "Should have three minted");
    expect(index === 3, "Reveal index should be 3 now that we've revealed currently minted");

    let currentStatsOne = await heroChainInstance.statMap(0);
    let currentStatsTwo = await heroChainInstance.statMap(1);
    let currentStatsThree = await heroChainInstance.statMap(2);

    for (var i = 0; i < 3; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      assert(currentStats.body !== 0, "First three should have no 0 stats post-reveal");
      assert(currentStats.mind !== 0, "First three should have no 0 stats post-reveal");
      assert(currentStats.energy !== 0, "First three should have no 0 stats post-reveal");
    }
 
    for (var i = 3; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      assert(currentStats.body === 0, "Should only be 0's for not yet minted/revealed nft");
      assert(currentStats.energy === 0, "Should only be 0's for not yet minted/revealed nft");
      assert(currentStats.mind === 0, "Should only be 0's for not yet minted/revealed nft");
    }

    for (var i = 3; i < totalMintCount; i++) {
      await heroChainInstance.mint();
    }
    index = await heroChainInstance.currentRevealIndex();
    supply = await heroChainInstance.totalSupply();
    expect(index).to.be.equal(3);
    expect(supply).to.be.equal(6);
 
    for (var i = 3; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      expect(currentStats.body).to.be.equal(0);
      expect(currentStats.mind).to.be.equal(0);
      expect(currentStats.energy).to.be.equal(0);
    }

    await heroChainInstance.reveal();
    index = await heroChainInstance.currentRevealIndex();
    expect(index).to.be.equal(6);
    
    for (var i = 0; i < totalMintCount; i++) {
      const currentStats = await heroChainInstance.statMap(i);
      expect(currentStats.body).to.not.be.equal(0);
      expect(currentStats.mind).to.not.be.equal(0);
      expect(currentStats.energy).to.not.be.equal(0);
    }

    let newCurrentStatsOne = await heroChainInstance.statMap(0);
    let newCurrentStatsTwo = await heroChainInstance.statMap(1);
    let newCurrentStatsThree = await heroChainInstance.statMap(2);
    expect(newCurrentStatsOne.body).to.be.equal(currentStatsOne.body);
    expect(newCurrentStatsOne.mind).to.be.equal(currentStatsOne.mind);
    expect(newCurrentStatsOne.energy).to.be.equal(currentStatsOne.energy);
    expect(newCurrentStatsTwo.body).to.be.equal(currentStatsTwo.body);
    expect(newCurrentStatsTwo.mind).to.be.equal(currentStatsTwo.mind);
    expect(newCurrentStatsTwo.energy).to.be.equal(currentStatsTwo.energy);
    expect(newCurrentStatsThree.body).to.be.equal(currentStatsThree.body);
    expect(newCurrentStatsThree.mind).to.be.equal(currentStatsThree.mind);
    expect(newCurrentStatsThree.energy).to.be.equal(currentStatsThree.energy);
  });

  it("Can't request tokenURI until metadata address set", async function() {
    await heroChainInstance.setClaimable(true);
    for (var i = 0; i < totalMintCount; i++) {
      await heroChainInstance.mint();
    }

    try {
      const tokenURI = await heroChainInstance.tokenURI(0);
      assert(false, "Should fail to get tokenURI when no metadata address set");
    } catch (err) {
      assert(err, "Should fail to show token URI");
    }

    
    await heroChainInstance.setMetadataAddresses(revealedRendererInstance.address, unrevealedRendererInstance.address);

    try {
      const tokenURI = await heroChainInstance.tokenURI(0);
      assert(tokenURI, "Should get TokenURI after metadata addresses set");
    } catch (err) {
      assert(false, "Should not fail to get tokenURI after setting metadata addresses");
    }
  });
  
  it("Should fail to get unminted token", async function() {  
    await heroChainInstance.setClaimable(true);
    await heroChainInstance.setMetadataAddresses(revealedRendererInstance.address, unrevealedRendererInstance.address);

    let tokenURI;

    try {
      tokenURI = await heroChainInstance.tokenURI(0);
      assert(false, "Should fail to get tokenURI when not yet minted");
    } catch (err) {
      assert(err, "Should fail to show token URI");
    }
     
    await heroChainInstance.mint();

    try {
      tokenURI = await heroChainInstance.tokenURI(0);
      assert(tokenURI, "Should get TokenURI after minting");
    } catch (err) {
      assert(false, "Should not fail to get tokenURI after minting");
    }

    try {
      tokenURI = await heroChainInstance.tokenURI(1);
      assert(false, "Should fail to get unminted token");
    } catch (err) {
      assert(err, "Should fail to get unminted token");
    }

    await heroChainInstance.mint();
    try {
      tokenURI = await heroChainInstance.tokenURI(1);
      assert(tokenURI, "Should get TokenURI after minting");
    } catch (err) {
      assert(false, "Should not fail to get tokenURI after minting");
    }
  });
  

  it("Token should return unrevealed until revealed", async function() {
    await heroChainInstance.setClaimable(true);
    for (var i = 0; i < totalMintCount; i++) {
      await heroChainInstance.mint();
    }
    
    await heroChainInstance.setMetadataAddresses(revealedRendererInstance.address, unrevealedRendererInstance.address);

    let tokenURI = await heroChainInstance.tokenURI(0);
    expect(tokenURI).to.be.equal("Unrevealed 0");

    tokenURI = await heroChainInstance.tokenURI(1);
    expect(tokenURI).to.be.equal("Unrevealed 1");

    await heroChainInstance.reveal();

    tokenURI = await heroChainInstance.tokenURI(0);
    expect(tokenURI).to.be.equal("Revealed 0");

    tokenURI = await heroChainInstance.tokenURI(1);
    expect(tokenURI).to.be.equal("Revealed 1");
  });

  it("New mints after reveal show unrevealed until subsequently revealed", async function() {
    await heroChainInstance.setClaimable(true);
    await heroChainInstance.mint();
    
    await heroChainInstance.setMetadataAddresses(
      revealedRendererInstance.address, 
      unrevealedRendererInstance.address);
    await heroChainInstance.reveal();
    await heroChainInstance.mint();

    tokenURI = await heroChainInstance.tokenURI(0);
    expect(tokenURI).to.be.equal("Revealed 0");

    tokenURI = await heroChainInstance.tokenURI(1);
    expect(tokenURI).to.be.equal("Unrevealed 1");

    await heroChainInstance.reveal();
    tokenURI = await heroChainInstance.tokenURI(0);
    expect(tokenURI).to.be.equal("Revealed 0");

    tokenURI = await heroChainInstance.tokenURI(1);
    expect(tokenURI).to.be.equal("Revealed 1");
  });

  it("Renderer test", async function() {
    await heroChainInstance.setClaimable(true);
    await heroChainInstance.mint();
    
    await heroChainInstance.setMetadataAddresses(
      basicRendererInstance.address, 
      unrevealedBasicRendererInstance.address);

    await heroChainInstance.reveal();
    const tokenURIOutput = await heroChainInstance.tokenURI(0);
    assert(tokenURIOutput, "Should have token output for revealed token");
    console.log(tokenURIOutput);
  });
});