// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract RoseDerby {

    uint public constant OWNER_TAKE = 2;
    uint private constant NUM_HORSES = 5;

    enum Horse { Black, Blue, Green, Red, White }

    struct Race {
        uint take;
         /// @notice The optional incentive (a percentage from each pool) awarded to the address that pays for the results computation on a race.
        uint callerIncentive;
        /// @notice The time (unix timestamp) at which the horses are lined up at the gate and no more bets are allowed.
        uint postTime;
        uint pool;
        bool finished;
    }

    struct PrivateRaceMeta {
        address organizer;
    }

    struct BetData {
        uint totalAmountBet;
        address[] bettors;
    }

    event RaceScheduled(
        uint256 index
    );
    
    event BetPlaced(
        uint256 index,
        Horse horse,
        uint amount
    );

    event RaceResultsDetermined(
         uint256 index, 
         uint8[5] results
     );

    address internal owner;

    Race[] public _races;
    PrivateRaceMeta[] internal _meta;
    mapping(uint256 => BetData[NUM_HORSES]) internal _betDataByHorseByRace;
    mapping(uint256 => mapping(address => uint)[NUM_HORSES]) internal _totalBetByBettorByHorseByRace;
    mapping(address => uint) private winnings;

    constructor() {
        owner = msg.sender;
    }

    modifier raceExists (uint256 index) {
        require(index < _races.length, "No such race");
        _;
    }

    function scheduleRace(uint postTime, uint take, uint callerIncentive) external {
        require(take + callerIncentive + OWNER_TAKE <= 100, "Takeout adds up to more than 100%");
        require(block.timestamp < postTime, "Post time should be in the future");

        Race memory race;
        race.take = take;
        race.callerIncentive = callerIncentive;
        race.postTime = postTime;

        _races.push(race);
        _meta.push(
            PrivateRaceMeta({
                organizer: msg.sender
            })
        );

        emit RaceScheduled(_races.length - 1);
    }

    function placeBet(uint256 index, Horse horse) external payable raceExists(index) {
        require(block.timestamp <= _races[index].postTime, "Race already started");
        require(msg.value >= 2 ether, "Minimum bet is 2 ROSE");
        
        uint8 horseNum = uint8(horse);
        _betDataByHorseByRace[index][horseNum].totalAmountBet += msg.value;

        if (_totalBetByBettorByHorseByRace[index][horseNum][msg.sender] == 0) {
            _betDataByHorseByRace[index][horseNum].bettors.push(msg.sender);
        }

        _totalBetByBettorByHorseByRace[index][horseNum][msg.sender] += msg.value;

        _races[index].pool += msg.value;

        emit BetPlaced(index, horse, msg.value);
    }

    function getRandomBytes(uint256 count, bytes memory pers) virtual internal view returns (bytes memory) {
        return Sapphire.randomBytes(count, pers);
    }

    function determineResults(uint256 index) external raceExists(index) {
        Race memory race = _races[index];

        require(block.timestamp >= race.postTime, "Race hasn't started");
        require(!race.finished, "Race results already determined");

        bytes memory randomBytes = getRandomBytes(5, "");

        uint8[5] memory results = [0, 1, 2, 3, 4];

        for (uint i = 0; i < results.length; i++) {
            uint8 randomInt = uint8(bytes1(randomBytes[i])) % 5;
            uint8 swap = results[randomInt];
            results[randomInt] = results[i];
            results[i] = swap;
        }

        uint8 winningHorseNum = results[0];
        BetData memory winningHorseBetData = _betDataByHorseByRace[index][winningHorseNum];
 
        winnings[owner] += (race.pool * OWNER_TAKE) / 100;
        winnings[_meta[index].organizer] += (race.pool * race.take) / 100;
        winnings[msg.sender] += (race.pool * race.callerIncentive) / 100;

        uint poolAfterTakeout = (_races[index].pool * (100 - (OWNER_TAKE + race.take + race.callerIncentive))) / 100;

        for (uint i = 0; i < winningHorseBetData.bettors.length; i++) {
            address winner = winningHorseBetData.bettors[i];
            uint winnerTotalBetOnWinningHorse = _totalBetByBettorByHorseByRace[index][winningHorseNum][winner];
            winnings[winner] += (poolAfterTakeout * winnerTotalBetOnWinningHorse) / winningHorseBetData.totalAmountBet;
        }

        if (winningHorseBetData.bettors.length == 0) {
            winnings[owner] += poolAfterTakeout;
        }

        _races[index].finished = true;

        emit RaceResultsDetermined(index, results);
    }

    function getWinningsBalance() external view returns (uint) {
      return winnings[msg.sender];
    }

    function withdraw() external {
        uint amount = winnings[msg.sender];
        
        require(amount > 0, "No funds to withdraw");
        require(address(this).balance >= amount, "Insufficient contract balance");

        winnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
    }
}