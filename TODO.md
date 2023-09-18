
# TODAY
------------------

# IN PROG
------------------

# TODO
------------------

# NOTES
------------------
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
