// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./VisibleRoseDerby.sol";
import "hardhat/console.sol";

// Overrides internal state vars for hardhat unit tests and 
// provides a deterministic override to getRandomBytes for repeatable RNG tests.
contract RoseDerbyTestDeterministic is VisibleRoseDerby {

    function getRandomBytes(uint256, bytes memory) internal override pure returns (bytes memory) {
        bytes memory notRandomBytes = "0xd1bc0f12ee";
        return notRandomBytes;

        // 0xd1bc0f12ee
        // byte 0: randomInt: 4
        // byte 1: randomInt: 3
        // byte 2: randomInt: 0
        // byte 3: randomInt: 3
        // byte 4: randomInt: 3
        // Results of shuffle:
        // 2, 3, 4, 0, 1
        // Winning Horse: 2
    }
}
