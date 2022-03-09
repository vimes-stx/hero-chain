/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../Interface/IHeroTokenRenderer.sol";
import "../Library/Base64.sol";
import "../Library/Utils.sol";
import "../HeroChain.sol";

contract BasicRenderer is Ownable, IHeroTokenRenderer
{
    address public heroChainContract;

    constructor(address _heroChainContract) Ownable() 
    { 
        heroChainContract = _heroChainContract;
    }    
    
    function tokenURI(uint256 tokenId) override external view returns (string memory)
    {
        require(heroChainContract != address(0), "Require hero chain main contract");
        (uint16 body, uint16 mind, uint16 energy) = HeroChain(heroChainContract).statMap(tokenId);
        string memory svg = buildSVG(body, mind, energy);
        string memory json = buildJSON(tokenId, svg, body, mind, energy);
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function buildJSON(uint256 tokenId, string memory svg, uint16 body, uint16 mind, uint16 energy) 
        private pure returns (string memory)
    {
        string memory mainBlob = string(
            abi.encodePacked(
                '{"name": "Hero #',
                Utils.uint2str(tokenId),
                '", "description": "Randomized, on-chain heroes for you to train, equip, and fight evil!", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '",',
                buildAttributes(body, mind, energy),
                '}'
            )
        );
        return Base64.encode(bytes(mainBlob));
    }

    function buildAttributes(uint16 body, uint16 mind, uint16 energy) private pure returns (string memory)
    {
        string memory output = string(abi.encodePacked(
            '"attributes": [',
                '{"trait_type":"body","value":', Utils.uint2str(body),'},',
                '{"trait_type":"mind","value":', Utils.uint2str(mind),'},',
                '{"trait_type":"energy","value":', Utils.uint2str(energy),'}',
            ']'
        ));
        return output;
    }

    function buildSVG(uint16 body, uint16 mind, uint16 energy) private pure returns (string memory)
    {
        string[7] memory parts;
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';
        parts[1] = string(abi.encodePacked("Body: ", Utils.uint2str(body)));
        parts[2] = '</text><text x="10" y="40" class="base">';
        parts[3] = string(abi.encodePacked("Mind: ", Utils.uint2str(mind)));
        parts[4] = '</text><text x="10" y="60" class="base">';
        parts[5] = string(abi.encodePacked("Energy: ", Utils.uint2str(energy)));
        parts[6] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6]
            )
        );
        
        return output;
    }
}