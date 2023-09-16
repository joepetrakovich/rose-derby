
# TODAY
------------------
DONE - fix starts in when under 2 mins it should do 1.XX
DONE - fix determine being inconsistent
DONE - add sounds
- animate bet amount and refresh of winnings
- record submission vid

# IN PROG
------------------

# TODO
------------------
- needed for hackathon entry:
-- demo walthrough video posted to youtube.
-- may redeploy just to clear race list
- optional-- a dev tutorial joe.ptrkv.ch
- it seems like determine results event isnt working because page only refreshes sometimes


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

-------------------------

## Inspiration

I was excited to see all the new documentation and activity on Sapphire and after having enjoyed building (my first dapp on it)[https://was.brosette.dev], I wanted to try something a bit more difficult that made us of Sapphire RNG.

## What it does

It's a horse betting "game", similar to real-world horse betting, except with simulated races using Sapphire RNG to determine the race results.  What makes it interesting is that the participants are all completely private but the statistics and game activity is public, so it's obvious people are playing (and winning), but no one knows _who_ is playing.  

Players are incentivized to schedule and find participants for races by setting a % organizer "take" which awards them a percentage of the total betting pool on a race.  Then once the betting window has ended, players are then further incentivized to call the "determine race results" function to compute the results with Sapphire RNG and receive an additional percentage of the pool.

I believe this project would be a great starter project for more serious web3 on-chain gaming or even for casinos.

## How I built it

I started with the hardhat boilerplate project with typescript so I could have a baseline to work from, then completed the main contract and got it unit tested.  Once that was done, I moved to the UI with SvelteKit (Svelte is amazing).  I tried to model the UI off typical web3 style dapps combined with sports betting sites that highlight current statistics.

## Challenges we ran into

It was tricky at first trying to come up with a way to schedule races and then determine the results.  At first I thought I'd have a bot that schedules them daily and determines the results, but that would have to come out of my own pocket.  Then I came up with a way to incentivize players to do it instead.  Since players would be the ones scheduling races and determining results, I had to write the contract in a way that wasn't too gas heavy.  You should do that anyway, but it did affect many of my decisions and storage and computation.  

It was also tricky at first to come up with unit tests considering the private nature of Oasis.  In the end I opted for using test overrides of internal accessors so I could test on hardhat network.  I also used a deterministic override for testing the functions that use RNG so that my test expectations could be fixed.

Finally, I wanted to simulate more of the betting types that real horse races allow (win bets, place bets, and show bets) but after analyzing how much additional complexity it would add and considering the hackathon deadline, I settled for only allowing win bets.

## Accomplishments that I'm proud of

It's nostalgic using old algorithms you learned way back when.  The race results algorithm takes 5 bytes of Sapphire RNG, converts them to integers bounded to 0-4 and then uses them to perform a random shuffle of the horses to find their final race positions.

## What I learned

The effortlessness of getting end-to-end encryption and selective privacy with Sapphire and the sapphire wrap sdk is very inspiring and has me excited about what else I can build that would normally take way longer and be less open with web2 alternatives.

Sapphire's documentation has improved since the last time I used it.  

## What's next for Rose Derby

I was nervous about submitting a dapp that could be considered "gambling", so I'm not sure what is next for that same reason considering the legal implications.  However I hope that others will use this project as a starting point.  

I may not grow the project further but I will certainly reference it for my next projects on Sapphire.