/// SPDX-License-Identifier: MIT
/// @title Weighted Random
/// @notice Provides functions for retrieving from a weighted random distribution
/// @author vimes_stx <vimes.stx@gmail.com>

pragma solidity ^0.8.0;

library Random
{
    function random(bytes32 seed) internal view returns (uint)
    {
        uint r = uint(keccak256(abi.encodePacked(seed, blockhash(block.number))));
        return r;
    }

    function random(bytes32 seed, uint max) internal view returns (uint)
    {
        require(max > 0, "Random needs range > 0");
        return random(seed) % max;
    }

    struct WeightedRandomSet
    {
        uint remainingCount;
        uint16[] values;
        mapping(uint16 => uint16) weightMap;
    }

    function populateWeightedRandomSet(WeightedRandomSet storage set, uint16[] memory values, uint16[] memory weights) internal
    {
        set.values = values;
        for (uint i = 0; i < values.length; i++)
        {
            uint16 value = values[i];
            set.remainingCount += weights[i];
            set.weightMap[value] = weights[i];
        }
    }
    
    function weightedRandom(WeightedRandomSet storage set, bytes32 seed) internal returns (uint)
    {
        uint16 _random = uint16(random(seed, set.remainingCount));
        uint output = 0;
        for (uint16 j = 0; j < set.values.length; j++)
        {
            uint16 value = set.values[j];
            if (_random > set.weightMap[value] || set.weightMap[value] == 0)
            {
                _random -= set.weightMap[value];
            }
            else
            {
                output = value;
                set.weightMap[value]--;
                set.remainingCount--;
                break;
            }
        }
        return output;
    }
}