// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract RoseDerby {

    uint public constant OWNER_TAKE = 2;

    struct HorseRace {
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

    enum Horse { Black, Blue, Green, Red, White }

    struct HorseBetData {
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

    address public owner;

    HorseRace[] public _races;
    PrivateRaceMeta[] private _meta;
    mapping(uint256 => mapping(Horse => HorseBetData)) private _betDataByHorseByRace;
    /// @notice Triple nesting to prevent large race results computation.  Results comes down to a particular horse's bettors and totals.
    mapping(uint256 => mapping(Horse => mapping(address => uint))) private _totalBetByBettorByHorseByRace;
    mapping(address => uint) private winnings;

    constructor() {
        owner = msg.sender;
    }

    modifier raceExists (uint256 index) {
        require(index < _races.length, "No such race");
        _;
    }

    function scheduleRace(uint postTime, uint take, uint callerIncentive) public {
        require(take + callerIncentive + OWNER_TAKE <= 100, "Takeout adds up to more than 100%");

        HorseRace memory race;
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
        
        _betDataByHorseByRace[index][horse].totalAmountBet += msg.value;

        if (_totalBetByBettorByHorseByRace[index][horse][msg.sender] == 0) {
            _betDataByHorseByRace[index][horse].bettors.push(msg.sender);
        }

        _totalBetByBettorByHorseByRace[index][horse][msg.sender] += msg.value;

        _races[index].pool += msg.value;

        emit BetPlaced(index, horse, msg.value);
    }

    function determineResults(uint256 index) external raceExists(index) {
        HorseRace memory race = _races[index];

        require(block.timestamp >= race.postTime, "Race hasn't started");
        require(!race.finished, "Race results already determined");

        bytes memory randomBytes = Sapphire.randomBytes(5, "");
        uint8[5] memory results = [0, 1, 2, 3, 4];

        for (uint i = 0; i < results.length; i++) {
            uint8 randomInt = uint8(bytes1(randomBytes[i])) % 4;
            uint8 swap = results[randomInt];
            results[randomInt] = results[i];
            results[i] = swap;
        }

        Horse winningHorse = Horse(results[0]);
        HorseBetData memory winningHorseBetData = _betDataByHorseByRace[index][winningHorse];

        uint totalTakeoutPercent = (OWNER_TAKE + race.take + race.callerIncentive) / 100;

        uint ownerTakeout = race.pool * (OWNER_TAKE / 100);
        winnings[owner] += ownerTakeout;
        //owner.transfer(ownerTakeout);

        uint organizerTakeout = race.pool * (race.take / 100);
        winnings[_meta[index].organizer] += organizerTakeout;
        //_meta[index].organizer.transfer(organizerTakeout);

        uint callerIncentiveTakeout = race.pool * (race.callerIncentive / 100);
        winnings[msg.sender] += callerIncentiveTakeout;
        //msg.sender.transfer(callerIncentiveTakeout);

        _races[index].pool = _races[index].pool * (1 - totalTakeoutPercent);

        for (uint i = 0; i < winningHorseBetData.bettors.length; i++) {
            address winner = winningHorseBetData.bettors[i];
            uint winnerProportion = _totalBetByBettorByHorseByRace[index][winningHorse][winner] / winningHorseBetData.totalAmountBet;
            uint prize = winnerProportion * _races[index].pool;
            //winner.transfer(prize);
            winnings[winner] += prize;
        }

        _races[index].finished = true;

        emit RaceResultsDetermined(index, results);
    }

    function withdraw() public {
        uint amount = winnings[msg.sender];
        
        require(amount > 0, "No funds to withdraw");
        require(address(this).balance >= amount, "Insufficient contract balance");

        winnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
    }
    
}

//  struct SecretMetadata {
//         address creator;
//         string name;
//         /// @notice How long (in seconds) the secret should remain so past the creator's last update.
//         uint256 longevity;/     }

//     event SecretCreated(
//         address indexed creator,
//         string indexed name,
//         uint256 index
//     );
//     event SecretRevealed(
//         address indexed creator,
//         string indexed name,
//         uint256 index
//     );

//     SecretMetadata[] public _metas;
//     bytes[] private _secrets;
//     /// @dev The unix timestamp at which the address was last seen.
//     mapping(address => uint256) public _lastSeen;

//     function createSecret(
//         string calldata name,
//         uint256 longevity,
//         bytes calldata secret
//     ) external {
//         _updateLastSeen();
//         _metas.push(
//             SecretMetadata({
//                 creator: msg.sender,
//                 name: name,
//                 longevity: longevity
//             })
//         );
//         _secrets.push(secret);
//         emit SecretCreated(msg.sender, name, _metas.length - 1);
//     }

//     /// @notice Reveals the secret at the specified index.
//     function revealSecret(uint256 index) external returns (bytes memory) {
//         require(index < _metas.length, "no such secret");
//         address creator = _metas[index].creator;
//         uint256 expiry = _lastSeen[creator] + _metas[index].longevity;
//         require(block.timestamp >= expiry, "not expired");
//         emit SecretRevealed(creator, _metas[index].name, index);
//         return _secrets[index];
//     }

//     /// @notice Returns the time (in seconds since the epoch) at which the owner was last seen, or zero if never seen.
//     function getLastSeen(address owner) external view returns (uint256) {
//         return _lastSeen[owner];
//     }

//     function getMetas(uint256 offset, uint256 count)
//         external
//         view
//         returns (SecretMetadata[] memory)
//     {
//         if (offset >= _metas.length) return new SecretMetadata[](0);
//         uint256 c = offset + count <= _metas.length
//             ? count
//             : _metas.length - offset;
//         SecretMetadata[] memory metas = new SecretMetadata[](c);
//         for (uint256 i = 0; i < c; ++i) {
//             metas[i] = _metas[offset + i];
//         }
//         return metas;
//     }

//     function refreshSecrets() external {
//         _updateLastSeen();
//     }

//     function _updateLastSeen() internal {
//         _lastSeen[msg.sender] = block.timestamp;
//     }