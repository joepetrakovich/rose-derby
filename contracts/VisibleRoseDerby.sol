// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./RoseDerby.sol";

// Overrides internal state vars for hardhat unit tests.
abstract contract VisibleRoseDerby is RoseDerby {

    function getOwner() public view returns (address) {
        return owner;
    }

    function getPrivateRaceMetaByHorseRace(uint256 index) public view returns (PrivateRaceMeta memory) {
        return _meta[index];
    }

    function getBetDataByHorseRaceAndHorse(uint256 index, Horse horse) public view returns (HorseBetData memory) {
        return _betDataByHorseByRace[index][horse];
    }

    function getTotalBetByHorseRaceHorseAndBettorAddress(uint256 index, Horse horse, address bettorAddress) public view returns (uint) {
        return _totalBetByBettorByHorseByRace[index][horse][bettorAddress];
    }
}
