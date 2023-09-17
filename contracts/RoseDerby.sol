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
        uint8 winner;
        uint8[NUM_HORSES] results;
    }

    struct PrivateRaceMeta {
        address organizer;
        bytes randomBytes;
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
         uint8[NUM_HORSES] results
     );

    address internal owner;

    Race[] public races;
    uint public totalWon;
    uint8[NUM_HORSES] public horseWins;

    PrivateRaceMeta[] internal _meta;
    mapping(uint256 => BetData[NUM_HORSES]) internal _betDataByHorseByRace;
    mapping(uint256 => mapping(address => uint)[NUM_HORSES]) internal _totalBetByBettorByHorseByRace;
    mapping(address => uint) private _winnings;

    constructor() {
        owner = msg.sender;
    }

    modifier raceExists (uint256 index) {
        require(index < races.length, "No such race");
        _;
    }

    function getRaces() external view returns (Race[] memory) {
        return races;
    }

    function getHorseWins() external view returns (uint8[5] memory) {
        return horseWins;
    }

    function getResults(uint256 index) external view raceExists(index) returns (uint8[5] memory) {
        return races[index].results;
    }

    function getWinningsBalance() external view returns (uint) {
        return _winnings[msg.sender];
    }

    function scheduleRace(uint postTime, uint take, uint callerIncentive) external {
        require(take + callerIncentive + OWNER_TAKE <= 100, "Takeout adds up to more than 100%");
        require(block.timestamp < postTime, "Post time should be in the future");

        Race memory race;
        race.take = take;
        race.callerIncentive = callerIncentive;
        race.postTime = postTime;

        races.push(race);
        _meta.push(
            PrivateRaceMeta({
                organizer: msg.sender,
                randomBytes: getRandomBytes(5, "")
            })
        );

        emit RaceScheduled(races.length - 1);
    }

    function placeBet(uint256 index, Horse horse) external payable raceExists(index) {
        require(block.timestamp <= races[index].postTime, "Race already started");
        require(msg.value >= 2 ether, "Minimum bet is 2 ROSE");
        
        uint8 horseNum = uint8(horse);
        _betDataByHorseByRace[index][horseNum].totalAmountBet += msg.value;

        if (_totalBetByBettorByHorseByRace[index][horseNum][msg.sender] == 0) {
            _betDataByHorseByRace[index][horseNum].bettors.push(msg.sender);
        }

        _totalBetByBettorByHorseByRace[index][horseNum][msg.sender] += msg.value;

        races[index].pool += msg.value;

        emit BetPlaced(index, horse, msg.value);
    }

    function getRandomBytes(uint256 count, bytes memory pers) virtual internal view returns (bytes memory) {
        return Sapphire.randomBytes(count, pers);
    }

    function determineResults(uint256 index) external raceExists(index) {
        Race memory race = races[index];

        require(block.timestamp >= race.postTime, "Race hasn't started");
        require(!race.finished, "Race results already determined");

        //randomBytes hidden and acquired prior to post time so malicious actor 
        //can't revert the results tx if it doesn't go their way.
        //The below array shuffle will always have the same outcome
        //no matter how many times the function is reverted and recalled.

        bytes memory randomBytes = _meta[index].randomBytes;
        uint8[5] memory results = [0, 1, 2, 3, 4];

        for (uint i = 0; i < results.length; i++) {
            uint8 randomInt = uint8(bytes1(randomBytes[i])) % 5;
            uint8 swap = results[randomInt];
            results[randomInt] = results[i];
            results[i] = swap;
        }

        uint8 winningHorseNum = results[0];
        BetData memory winningHorseBetData = _betDataByHorseByRace[index][winningHorseNum];
 
        _winnings[owner] += (race.pool * OWNER_TAKE) / 100;
        _winnings[_meta[index].organizer] += (race.pool * race.take) / 100;
        _winnings[msg.sender] += (race.pool * race.callerIncentive) / 100;

        uint poolAfterTakeout = (races[index].pool * (100 - (OWNER_TAKE + race.take + race.callerIncentive))) / 100;

        for (uint i = 0; i < winningHorseBetData.bettors.length; i++) {
            address winner = winningHorseBetData.bettors[i];
            uint winnerTotalBetOnWinningHorse = _totalBetByBettorByHorseByRace[index][winningHorseNum][winner];
            uint amountWon = (poolAfterTakeout * winnerTotalBetOnWinningHorse) / winningHorseBetData.totalAmountBet;
            _winnings[winner] += amountWon;
            totalWon += amountWon;
        }

        if (winningHorseBetData.bettors.length == 0) {
            _winnings[owner] += poolAfterTakeout;
        }

        races[index].finished = true;
        races[index].winner = winningHorseNum;
        races[index].results = results;
        horseWins[winningHorseNum] += 1;

        emit RaceResultsDetermined(index, results);
    }

    function withdraw() external {
        uint amount = _winnings[msg.sender];
        
        require(amount > 0, "No funds to withdraw");
        require(address(this).balance >= amount, "Insufficient contract balance");

        _winnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
    }
}