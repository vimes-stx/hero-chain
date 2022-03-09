// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICorruptionsMetadata {
    function tokenURI(uint256 tokenId, uint256 amount) external view returns (string memory);
}