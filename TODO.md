
# TODAY
------------------
DONE - styling of results.
DONE -- color dot on racelist
DONE -- ordered horse svgs on race view.
DONE -- added next race countdown

# IN PROG
------------------

# TODO
------------------
- needed for hackathon entry:
-- demo walthrough video posted to youtube.
-- add some comments
--optional-- a dev tutorial joe.ptrkv.ch

- nice to haves
--- animation of horses running while determine race tx is going
--- live flashing events for races scheduled, bets, determining results (all useful live events)
--- when time passes posttime while you're on the race page, it should be reactive and show determine results button, same with after determining them
--- a record of "my races" with bets so you know what you won, what you played in.



# NOTES
------------------
Deloying the contracts with the account: 0x1Bca6F7bb997Bb9aE3164bB61a468F2a86893A30
Rose Derby deployed to 0xb80377133EA58212E9ad9bB393483b9B8Dc00A10

- could have a "posting soon" timer store that updates live
- track time

-- may need to add getters for your current bets, balances so you can see what races you're in via msg.sender

- count down races post time until posted.
- could just grab the time once and count down.

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
