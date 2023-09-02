
# TODAY
------------------

# TODO
------------------
DONE - implement scheduling a race (and getting an id for it..or maybe you create it like in smash)
DONE -- all races are public at first.
DONE - implement placing bets (which tally up odds)
DONE - implement finishing race (computing winners, payouts)
DONE - write basic tests to validate all the funcs

Deloying the contracts with the account: 0x1Bca6F7bb997Bb9aE3164bB61a468F2a86893A30
Rose Derby deployed to 0x4232017dBad2B11B6E5c073a33C6aF0d36Abb2d9

- build ui
-- home page shows scheduled and finished races (current bets, odds, players can be anon, wins)
--- connect to network ux
-- ability to place bets on scheduled races
--- start with win only. 5 horses
-- ability to create a race.
-- may need to add getters for your current bets, balances so you can see what races you're in via msg.sender

# NOTES
------------------
- client can compute odds by reading bet events, but when its time to compute the payout, 
do the odds need to be available? i.e. should the better pay for the pre-computation of odds or 
should the organizer?
- if we allowed private races, the race could still get an ID but
you couldn't view it unless you signed a message and were someone who the organizer added
as an allowed player.
- could be like smash online where you have to create the room ID but someone could guess it.

//when bets are recorded, is there a way to store them such that I can ask:
//1. whats the total bet on that winning horse?
//2. who bet on that horse?
//3. how much did they bet on that horse? => what is there proportion? 
