// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./VisibleRoseDerby.sol";
import "hardhat/console.sol";

// Overrides Sapphire's getRandomBytes with a good-enough-for-testing RNG function
// so hardhat network can be used for fast unit-tests.
contract RoseDerbyTestNonDeterministic is VisibleRoseDerby {

    function getRandomBytes(uint256 count, bytes memory pers) internal override view returns (bytes memory) {
        uint256 words = (count + 31) >> 5;
        bytes memory out = new bytes(words << 5);
        bytes32 seed = keccak256(
            abi.encodePacked(
                msg.sender,
                blockhash(block.number),
                block.timestamp,
                block.prevrandao,
                block.coinbase,
                count,
                pers
            )
        );
        for (uint256 i = 0; i < words; i++) {
            seed = keccak256(abi.encodePacked(seed, i, blockhash(block.number - i)));
            assembly {
                mstore(add(out, add(32, mul(32, i))), seed)
            }
        }
        assembly {
            mstore(out, count)
        }
        return out;
    }
}
