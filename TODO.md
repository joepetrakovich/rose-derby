
# TODAY
------------------
DONE - clean up create race design
- clean up race list item design


# IN PROG
------------------
- get it looking good, mobile first then out.
-- jump to create race ui since new contracts lose data
- then add the events back in carefully for live stuff


# TODO
------------------
DONE - base line UI reqs
- demo walthrough video posted to youtube.
- add some comments
- fix getWinnings signature bug
--- must be a bug because getWinnings should need a signature right? and account 2 should have some takeout awarded.. if i add withdraw I should see it..
- deploy so people can use when its functional

- nice to haves
-- cleaned up ui (bootstrappy)
- start cleaning up place bet + single race view design
--- countdowns
--- a progress bar before horses get to race.
--- a animation of horses running while determine race tx is going
--- go back to winnings to compute x/x odds? or % wins
--- live flashing events for races scheduled, bets, determining results (all useful live events)
- fix memory leaks (also may be partly the non-filtered events?)
- a dev tutorial joe.ptrkv.ch
- connect button connects to sapphire in one fell swoop

# NOTES
------------------
Deloying the contracts with the account: 0x1Bca6F7bb997Bb9aE3164bB61a468F2a86893A30
Rose Derby deployed to 0xBd2D43D3A87088ccAF9A9191DfA1080f36290977

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
