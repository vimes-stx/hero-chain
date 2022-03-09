// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Interface/IHeroTokenRenderer.sol";
import "./Library/Random.sol";
import "./Library/Utils.sol";

contract HeroChain is ERC721Enumerable, ReentrancyGuard, Ownable
{
    using Random for *;
    
    struct HeroStats
    {
        uint16 body;
        uint16 mind;
        uint16 energy;
    }

    uint public supply;
    bool public claimable = false;
    mapping (uint256 => HeroStats) public statMap;
    
    address public tokenRenderer;
    address public unrevealedTokenRenderer;

    Random.WeightedRandomSet public bodySet;
    Random.WeightedRandomSet public mindSet;
    Random.WeightedRandomSet public energySet;
    uint public currentRevealIndex;

    constructor(
        uint16[] memory _bodyValues, uint16[] memory _bodyWeights,
        uint16[] memory _mindValues, uint16[] memory _mindWeights,
        uint16[] memory _energyValues, uint16[] memory _energyWeights) ERC721("HeroChain", "HEROCHAIN") Ownable()
    {
        bodySet.populateWeightedRandomSet(_bodyValues, _bodyWeights);
        mindSet.populateWeightedRandomSet(_mindValues, _mindWeights);
        energySet.populateWeightedRandomSet(_energyValues, _energyWeights);

        require(bodySet.remainingCount == mindSet.remainingCount, "Body and mind supply mismatch");
        require(bodySet.remainingCount == energySet.remainingCount, "Body and energy supply mismatch");

        supply = bodySet.remainingCount;
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory)
    {
        require(tokenRenderer != address(0), "Missing render address");
        require(unrevealedTokenRenderer != address(0), "Missing render address");
        require(tokenId < totalSupply(), "Hero token does not exist");

        if (tokenId >= currentRevealIndex)
        {
            return IHeroTokenRenderer(unrevealedTokenRenderer).tokenURI(tokenId);
        }        
        return IHeroTokenRenderer(tokenRenderer).tokenURI(tokenId);
    }
    
    //Use this to hook on transfer events for something
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function mint() external nonReentrant
    {
        require(claimable, "Heroes not currently claimable");
        require(totalSupply() < supply, "All heroes have been claimed");
        _mint(_msgSender(), totalSupply());
    }

    function setMetadataAddresses(address _tokenRenderer, address _unrevealedTokenRenderer) external onlyOwner
    {
        tokenRenderer = _tokenRenderer;
        unrevealedTokenRenderer = _unrevealedTokenRenderer;
    }

    function setClaimable(bool _claimable) public onlyOwner
    {
        claimable = _claimable;
    }

    function reveal() public onlyOwner
    {
        for (uint i = currentRevealIndex; i < totalSupply(); i++)
        {
            bytes32 bodyBytes = Utils.bytesToBytes32(abi.encodePacked(i * supply + 0), 0);
            bytes32 mindBytes = Utils.bytesToBytes32(abi.encodePacked(i * supply + 1), 0);
            bytes32 energyBytes = Utils.bytesToBytes32(abi.encodePacked(i * supply + 2), 0);

            statMap[i].body = uint16(bodySet.weightedRandom(bodyBytes));
            statMap[i].mind = uint16(mindSet.weightedRandom(mindBytes));
            statMap[i].energy = uint16(energySet.weightedRandom(energyBytes));

            currentRevealIndex++;
        } 
    }
}