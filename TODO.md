
# TODO
------------------
- implement scheduling a race (and getting an id for it..or maybe you create it like in smash)
-- all races are public at first.
- implement placing bets (which tally up odds)
- implement finishing race (computing winners, payouts)
- build ui
-- home page shows scheduled and finished races (current bets, odds, players can be anon, wins)
-- ability to place bets on scheduled races
--- start with win only. 4 horses
-- ability to create a race.

# NOTES
------------------
- client can compute odds by reading bet events, but when its time to compute the payout, 
do the odds need to be available? i.e. should the better pay for the pre-computation of odds or 
should the organizer?
- if we allowed private races, the race could still get an ID but
you couldn't view it unless you signed a message and were someone who the organizer added
as an allowed player.
- could be like smash online where you have to create the room ID but someone could guess it.
