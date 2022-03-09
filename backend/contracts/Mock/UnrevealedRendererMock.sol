/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../Interface/IHeroTokenRenderer.sol";
import "../Library/Base64.sol";
import "../Library/Utils.sol";

contract UnrevealedRendererMock is Ownable, IHeroTokenRenderer
{
    constructor() Ownable() { }
    
    function tokenURI(uint256 tokenId) override external pure returns (string memory)
    {
        return string(abi.encodePacked("Unrevealed ", Utils.uint2str(tokenId)));
    }
}