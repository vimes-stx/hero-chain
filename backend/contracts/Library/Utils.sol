/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library Utils
{
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function bytesToBytes32(bytes memory b, uint offset) internal pure returns (bytes32)
    {
        bytes32 out;
        for (uint i = 0; i < 32; i++) {
            out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
        }
        return out;
    }

    // take bytes32 and return a string
    function toShortString(bytes32 _data) internal pure returns (string memory)
    {
        // create new bytes with a length of 32
        // needs to be bytes type rather than bytes32 in order to be writeable
        bytes memory _bytesContainer = new bytes(32);
        // uint to keep track of actual character length of string
        // bytes32 is always 32 characters long the string may be shorter
        uint256 _charCount = 0;
        // loop through every element in bytes32
        for (uint256 _bytesCounter = 0; _bytesCounter < 32; _bytesCounter++) {
            /*
            TLDR: takes a single character from bytes based on counter
            convert bytes32 data to uint in order to increase the number enough to
            shift bytes further left while pushing out leftmost bytes
            then convert uint256 data back to bytes32
            then convert to bytes1 where everything but the leftmost hex value (byte)
            is cutoff leaving only the leftmost byte
            */
            bytes1 _char = bytes1(bytes32(uint256(_data) * 2 ** (8 * _bytesCounter)));
            // if the character is not empty
            if (_char != 0) {
            // add to bytes representing string
            _bytesContainer[_charCount] = _char;
            // increment count so we know length later
            _charCount++;
            }
        }

        // create dynamically sized bytes array to use for trimming
        bytes memory _bytesContainerTrimmed = new bytes(_charCount);

        // loop through for character length of string
        for (uint256 _charCounter = 0; _charCounter < _charCount; _charCounter++) {
            // add each character to trimmed bytes container, leaving out extra
            _bytesContainerTrimmed[_charCounter] = _bytesContainer[_charCounter];
        }

        // return correct length string with no padding
        return string(_bytesContainerTrimmed);
    }
}