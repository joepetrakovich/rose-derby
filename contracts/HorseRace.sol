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
        bool finished;
    }

    struct PrivateRaceMeta {
        address organizer;
    }

    enum Horse { Black, Blue, Green, Red, White, Orange, Purple, Yellow }
    enum BetType { Win, Place }

    struct Bet {
        address bettor;
        Horse horse;
        BetType betType;
        uint amount;
    }

    struct Pool { 
        Bet[] bets;
        uint total;
    }

    event RaceScheduled(
        uint256 index
    );
    
    event BetPlaced(
        uint256 index,
        Horse horse,
        BetType betType,
        uint amount
    );

    event RaceResultsDetermined(
         uint256 index, 
         uint8[8] results
     );

    address public owner;

    HorseRace[] public _races;
    PrivateRaceMeta[] private _meta;
    mapping(uint256 => Pool[2]) private _pools;

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

    function placeBet(uint256 index, Horse horse, BetType betType) external payable raceExists(index) {
        require(block.timestamp <= _races[index].postTime, "Race already started");
        require(msg.value >= 2 ether, "Minimum bet is 2 ROSE");
        
        _pools[index][uint8(betType)].bets.push(
            Bet({
                bettor: msg.sender,
                betType: betType,
                amount: msg.value,
                horse: horse
            })
        );

        _pools[index][uint8(betType)].total += msg.value;

        emit BetPlaced(index, horse, betType, msg.value);
    }

    function determineResults(uint256 index) external raceExists(index) {
        require(block.timestamp >= _races[index].postTime, "Race hasn't started");
        require(!_races[index].finished, "Race results already determined");

        bytes memory randomBytes = Sapphire.randomBytes(8, "");
        uint8[8] memory results = [0, 1, 2, 3, 4, 5, 6, 7];

        for (uint i = 0; i < 8; i++) {
            uint8 randomInt = uint8(bytes1(randomBytes[i])) % 7;
            uint8 swap = results[randomInt];
            results[randomInt] = results[i];
            results[i] = swap;
        }

        Horse first = Horse(results[0]);
        Horse second = Horse(results[1]);

        uint totalPool = _pools[index][uint8(BetType.Win)].total + _pools[index][uint8(BetType.Place)].total;
        uint totalTakeout = (OWNER_TAKE + _races[index].take + _races[index].callerIncentive) / 100;

        uint ownerTakeout = totalPool * (OWNER_TAKE / 100);
        uint organizerTakeout = totalPool * (_races[index].take / 100);
        uint callerIncentiveTakeout = totalPool * (_races[index].callerIncentive / 100);

        uint winPool = _pools[index][uint8(BetType.Win)].total * (1 - totalTakeout);
        uint placePool = _pools[index][uint8(BetType.Place)].total * (1 - totalTakeout);

        //compute winning ticket addr payouts.
        //what percent of the winning horse bets is your bets? you win that much of the pool
        //total of bets / total winning horse bets = proportion
        //winnings = proportion * total pool
    

        //transfer all payouts

        _races[index].finished = true;

        emit RaceResultsDetermined(index, results);
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