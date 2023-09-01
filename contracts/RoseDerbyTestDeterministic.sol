// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./VisibleRoseDerby.sol";
import "hardhat/console.sol";

// Overrides internal state vars for hardhat unit tests and 
// provides a deterministic override to getRandomBytes for repeatable RNG tests.
contract RoseDerbyTestDeterministic is VisibleRoseDerby {

    function getRandomBytes(uint256, bytes memory) internal override pure returns (bytes memory) {
        bytes memory notRandomBytes = "0x3078353436333633";
        return notRandomBytes;

        // 0x3078353436333633
        // byte 0: randomInt: 0
        // byte 1: randomInt: 0
        // byte 2: randomInt: 3
        // byte 3: randomInt: 0
        // byte 4: randomInt: 7
        // byte 5: randomInt: 0
        // byte 6: randomInt: 3
        // byte 7: randomInt: 5
        // 5,0,3,6,7,4,1,2
        // Winning horse: 5
    }

    //Test function to aid in simulating insufficient contract funds for winner payouts.
    function burnBalance() public {
        address payable burnAddress = payable(0x0000000000000000000000000000000000000000);
        burnAddress.transfer(address(this).balance);
    }
}
