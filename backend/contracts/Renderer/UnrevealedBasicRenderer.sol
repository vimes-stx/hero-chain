/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../Interface/IHeroTokenRenderer.sol";
import "../Library/Base64.sol";
import "../Library/Utils.sol";

contract UnrevealedBasicRenderer is Ownable, IHeroTokenRenderer
{
    constructor() Ownable() { }
    
    function tokenURI(uint256 tokenId) override external pure returns (string memory)
    {
        string memory svg = buildSVG();
        string memory json = buildJSON(tokenId, svg);
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function buildJSON(uint256 tokenId, string memory svg) private pure returns (string memory)
    {
        string memory mainBlob = string(
            abi.encodePacked(
                '{"name": "Hero #',
                Utils.uint2str(tokenId),
                '", "description": "Randomized, on-chain heroes for you to train, duel, and tackle challenges with!", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '"}'
            )
        );
        return Base64.encode(bytes(mainBlob));
    }

    function buildSVG() private pure returns (string memory)
    {
        string[3] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';
        parts[1] = "HERO NOT YET REVEALED";
        parts[2] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2]
            )
        );
        return output;
    }
}