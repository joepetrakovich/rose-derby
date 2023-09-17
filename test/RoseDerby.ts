import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import { ethers } from "hardhat";

  describe("HorseRace", function () {

    async function deployRoseDerbyFixture() {
      //common race scheduled 1 hour later
      const postTime = (await time.latest()) + 60 * 60;
      const [owner, accountTwo, accountThree, accountFour] = await ethers.getSigners();
  
      const RoseDerby = await ethers.getContractFactory("RoseDerby");
      const roseDerby = await RoseDerby.deploy();

      const RoseDerbyTestNonDeterministic = await ethers.getContractFactory("RoseDerbyTestNonDeterministic");
      const roseDerbyNonDeterministic = await RoseDerbyTestNonDeterministic.deploy();

      const RoseDerbyTestDeterministic = await ethers.getContractFactory("RoseDerbyTestDeterministic");
      const roseDerbyDeterministic = await RoseDerbyTestDeterministic.deploy();

      const ownerTake = await roseDerby.OWNER_TAKE();
  
      return { roseDerby, roseDerbyNonDeterministic, roseDerbyDeterministic, owner, accountTwo, accountThree, accountFour, postTime, ownerTake };
    }
  
    describe("Deployment", () => {
      it("Should set the owner", async () => {
        const { roseDerbyNonDeterministic, owner } = await loadFixture(deployRoseDerbyFixture);

        expect(await roseDerbyNonDeterministic.getOwner()).to.equal(owner.address);
      });

      it("Should start with a zero balance", async () => {
        const { roseDerby } = await loadFixture(deployRoseDerbyFixture);

        expect(await ethers.provider.getBalance(roseDerby.target)).to.equal(0);
      });
    });

    describe("Scheduling races", () => {
      it("Should fail if you try to set a takeout amount greater than 100%", async () => {
        const { roseDerby, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);

        await expect(roseDerby.connect(accountTwo)
          .scheduleRace(postTime, 97, 2))
          .to.be.revertedWith("Takeout adds up to more than 100%");
      });

      it("Should fail if the postTime is not in the future", async function () {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const latestTime = await time.latest();
        
        await expect(roseDerby.connect(accountTwo)
          .scheduleRace(latestTime, 2, 2))
          .to.be.revertedWith("Post time should be in the future");
      });

      it("Should set the right values on a new race and add it to the races array", async () => {
        const { roseDerby, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);

        await roseDerby.connect(accountTwo)
          .scheduleRace(postTime, 5, 5);
        const race = await roseDerby.races(0);
        expect(race).to.deep.equal([5, 5, postTime, 0, false, 0]);
      });

      it("Should allow you to query all races", async () => {
        const { roseDerby, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);

        await roseDerby.connect(accountTwo).scheduleRace(postTime, 5, 5);

        const races = await roseDerby.getRaces();

        expect(races).to.be.a("Array");
        expect(races.length).to.equal(1);
      });

      it("Should set the organizer and randomBytes as private race metadata", async () => {
        const { roseDerbyDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);

        await roseDerbyDeterministic.connect(accountTwo).scheduleRace(postTime, 5, 5);

        const meta = await roseDerbyDeterministic.getPrivateRaceMetaByHorseRace(0);
        expect(meta.organizer).to.equal(accountTwo.address);
        expect(meta.randomBytes).to.equal("0x307864316263306631326565");
      });
    });

    describe("Placing bets", () => {

      it("Should fail if the race doesn't exist", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);

        await expect(roseDerby.connect(accountTwo).placeBet(0, 1))
              .to.be.revertedWith("No such race");
      });

      it("Should fail if you try to place a bet after the post time", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);

        const postTime = await time.latest() + 60;
        await roseDerby.connect(accountTwo)
          .scheduleRace(postTime, 5, 5);

        await time.increaseTo(postTime);

        await expect(roseDerby.connect(accountTwo)
          .placeBet(0, 1))
          .to.be.revertedWith("Race already started");
      });

      it("Should fail if you try to place a bet for less than 2 ROSE", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);

        const postTime = await time.latest() + 60;
        await roseDerby.connect(accountTwo)
          .scheduleRace(postTime, 5, 5);

        await expect(roseDerby.connect(accountTwo)
          .placeBet(0, 1, { value: ethers.parseEther('1') }))
          .to.be.revertedWith("Minimum bet is 2 ROSE");
      });

      it("Should increase the total pool by the bet amount", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerby.connect(accountTwo);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        let race = await roseDerby.races(0);
        expect(race.pool).to.equal(0);

        await account.placeBet(0, 1, { value: betAmount });

        race = await roseDerby.races(0);
        expect(race.pool).to.equal(betAmount);
      });

      it("Should increase the total amount bet on the horse", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        let horseZeroBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 0);
        expect(horseZeroBetData.totalAmountBet).to.equal(0);

        let horseOneBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 1);
        expect(horseOneBetData.totalAmountBet).to.equal(0);

        await account.placeBet(0, 0, { value: betAmount });
        await account.placeBet(0, 0, { value: betAmount });
        await account.placeBet(0, 1, { value: betAmount });

        horseZeroBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 0);
        expect(horseZeroBetData.totalAmountBet).to.equal(betAmount * BigInt(2));

        horseOneBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 1);
        expect(horseOneBetData.totalAmountBet).to.equal(betAmount);
      });

      it("Should add a bettor's address to a horse's bettor registry", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        await account.placeBet(0, 0, { value: betAmount });

        let horseZeroBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 0);
        expect(horseZeroBetData.bettors[0]).to.equal(accountTwo.address);
      });

      
      it("Shouldn't add a bettor to a horse's bettor registry more than once", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, accountTwo, accountThree } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);
        const otherAccount = await roseDerbyDeterministic.connect(accountThree);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        await account.placeBet(0, 0, { value: betAmount });
        await account.placeBet(0, 0, { value: betAmount });
        await otherAccount.placeBet(0, 0, { value: betAmount });
        await otherAccount.placeBet(0, 0, { value: betAmount });

        let horseZeroBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 0);
        expect(horseZeroBetData.bettors[0]).to.equal(accountTwo.address);
        expect(horseZeroBetData.bettors[1]).to.equal(accountThree.address);
        expect(horseZeroBetData.bettors.length).to.equal(2);
      });

      it("Should increase the total amount bet per horse by the bettor", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, accountTwo, accountThree } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);
        const otherAccount = await roseDerbyDeterministic.connect(accountThree);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        await account.placeBet(0, 0, { value: betAmount });
        await account.placeBet(0, 0, { value: betAmount });
        await account.placeBet(0, 0, { value: betAmount });
        await otherAccount.placeBet(0, 0, { value: betAmount });
        await otherAccount.placeBet(0, 0, { value: betAmount });
        await otherAccount.placeBet(0, 1, { value: betAmount });

        const totalBetByAccountTwoOnHorseZero = await roseDerbyDeterministic.getTotalBetByHorseRaceHorseAndBettorAddress(0, 0, accountTwo.address);
        expect(totalBetByAccountTwoOnHorseZero).to.equal(betAmount * BigInt(3));

        const totalBetByAccountThreeOnHorseZero = await roseDerbyDeterministic.getTotalBetByHorseRaceHorseAndBettorAddress(0, 0, accountThree.address);
        expect(totalBetByAccountThreeOnHorseZero).to.equal(betAmount * BigInt(2));

        const totalBetByAccountThreeOnHorseOne = await roseDerbyDeterministic.getTotalBetByHorseRaceHorseAndBettorAddress(0, 1, accountThree.address);
        expect(totalBetByAccountThreeOnHorseOne).to.equal(betAmount);
      });

    });

    describe("Determining race results", () => {

      it("Should fail if the race doesn't exist", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerby.connect(accountTwo);

        await expect(account.determineResults(0)).to.be.revertedWith("No such race");
      });

      it("Should fail if you try to determine results before the post time", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerby.connect(accountTwo);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);

        await expect(account.determineResults(0)).to.be.revertedWith("Race hasn't started");
      });

      it("Should fail if you try to determine results on an already-finished race", async () => {
        const { roseDerbyNonDeterministic, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const account = roseDerbyNonDeterministic.connect(accountTwo);

        const postTime = await time.latest() + 60;
        await account.scheduleRace(postTime, 5, 5);
        await time.increaseTo(postTime);
        await account.determineResults(0);

        await expect(account.determineResults(0)).to.be.revertedWith("Race results already determined");
      });

      it("Should increase the owner's winnings by the owner take proportion", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, owner, accountTwo, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const ownerAccount = await roseDerbyDeterministic.connect(owner);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        await account.scheduleRace(postTime, 5, 5);
        await account.placeBet(0, 2, { value: betAmount });
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await account.determineResults(0);

        const expected = (race.pool * ownerTake) / BigInt(100);
        const actual = await ownerAccount.getWinningsBalance();

        expect(actual).to.be.greaterThan(0);
        expect(actual).to.be.equal(expected);
      });

      it("Should increase the organizer's winnings by the organizer take proportion", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, accountTwo, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const organizerTake = 5;
        await organizer.scheduleRace(postTime, organizerTake, 0);
        //don't bet on winning horse (2) so organizer loses
        await organizer.placeBet(0, 0, { value: betAmount }); 
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await organizer.determineResults(0);

        const expected = (race.pool * BigInt(organizerTake)) / BigInt(100);
        const actual = await organizer.getWinningsBalance();

        expect(actual).to.be.greaterThan(0);
        expect(actual).to.be.equal(expected);
      });

      it("Should increase the caller's winnings by the caller incentive proportion", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, accountTwo, accountThree } = await loadFixture(deployRoseDerbyFixture);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const raceCaller = await roseDerbyDeterministic.connect(accountThree);
        const callerIncentive = 6;
        
        await organizer.scheduleRace(postTime, 0, callerIncentive);
        await organizer.placeBet(0, 0, { value: betAmount }); 
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await raceCaller.determineResults(0);

        const expected = (race.pool * BigInt(callerIncentive)) / BigInt(100);
        const actual = await raceCaller.getWinningsBalance();

        expect(actual).to.be.greaterThan(0);
        expect(actual).to.be.equal(expected);
      });

      it("Should increase all the winning address's winnings proportional to the bets on the winning horse", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, accountTwo, accountThree, accountFour, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const winningBettor = await roseDerbyDeterministic.connect(accountThree);
        const winningBettor2x = await roseDerbyDeterministic.connect(accountFour);
        const organizerTake = 2
        const callerIncentive = 0;
        
        await organizer.scheduleRace(postTime, organizerTake, callerIncentive);
        await organizer.placeBet(0, 0, { value: betAmount }); 
        await winningBettor.placeBet(0, 2, { value: betAmount }); 
        await winningBettor2x.placeBet(0, 2, { value: betAmount * BigInt(2) }); 
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount * BigInt(4));
        
        await time.increaseTo(postTime);
        await organizer.determineResults(0);

        const poolAfterTakeout = (race.pool * (BigInt(100) - (BigInt(organizerTake) + BigInt(callerIncentive) + BigInt(ownerTake)))) / BigInt(100);

        const winningHorseBetData = await roseDerbyDeterministic.getBetDataByHorseRaceAndHorse(0, 2);
        expect(winningHorseBetData.totalAmountBet).to.equal(betAmount * BigInt(3));

        //1x bettor should get 1/3rd of pot.

        const winningBettorTotalAmountBet = await roseDerbyDeterministic.getTotalBetByHorseRaceHorseAndBettorAddress(0, 2, accountThree.address);
        expect(winningBettorTotalAmountBet).to.equal(betAmount);

        const winningBettorExpectedWinnings = (poolAfterTakeout * winningBettorTotalAmountBet) / winningHorseBetData.totalAmountBet;
        const winningBettorActualWinnings = await winningBettor.getWinningsBalance();

        expect(winningBettorActualWinnings).to.be.equal(winningBettorExpectedWinnings);

        //2x bettor should get 2/3rds of pot.
        
        const winningBettor2xTotalAmountBet = await roseDerbyDeterministic.getTotalBetByHorseRaceHorseAndBettorAddress(0, 2, accountFour.address);
        expect(winningBettor2xTotalAmountBet).to.equal(betAmount * BigInt(2));

        const winningBettor2xExpectedWinnings = (poolAfterTakeout * winningBettor2xTotalAmountBet) / winningHorseBetData.totalAmountBet;
        const winningBettor2xActualWinnings = await winningBettor2x.getWinningsBalance();

        expect(winningBettor2xActualWinnings).to.be.equal(winningBettor2xExpectedWinnings);
      });

      it("Should payout the entire pool when there is a winner", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, owner, accountTwo, accountThree, accountFour, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const ownerAccount = await roseDerbyDeterministic.connect(owner);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const raceCaller = await roseDerbyDeterministic.connect(accountThree);
        const winningBettor = await roseDerbyDeterministic.connect(accountFour);
        const organizerTake = 2
        const callerIncentive = 2;
        
        await organizer.scheduleRace(postTime, organizerTake, callerIncentive);
        await organizer.placeBet(0, 0, { value: betAmount }); 
        await winningBettor.placeBet(0, 2, { value: betAmount }); 
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount * BigInt(2));
        
        await time.increaseTo(postTime);
        await raceCaller.determineResults(0);

        const poolAfterTakeout = (race.pool * (BigInt(100) - (BigInt(organizerTake) + BigInt(callerIncentive) + BigInt(ownerTake)))) / BigInt(100);

        const expectedOwnerWinnings = (race.pool * BigInt(ownerTake)) / BigInt(100);
        const expectedOrganizerWinnings = (race.pool * BigInt(organizerTake)) / BigInt(100);
        const expectedCallerWinnings = (race.pool * BigInt(callerIncentive)) / BigInt(100);
        const expectedWinnerWinnings = poolAfterTakeout;

        expect(await ownerAccount.getWinningsBalance()).to.be.equal(expectedOwnerWinnings);
        expect(await organizer.getWinningsBalance()).to.be.equal(expectedOrganizerWinnings);
        expect(await raceCaller.getWinningsBalance()).to.be.equal(expectedCallerWinnings);
        expect(await winningBettor.getWinningsBalance()).to.be.equal(expectedWinnerWinnings);
        expect(expectedOwnerWinnings + expectedOrganizerWinnings + expectedCallerWinnings + expectedWinnerWinnings)
          .to.be.equal(race.pool);
      });

      it("Should keep a running total of winnings", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, owner, accountTwo, accountThree, accountFour, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const ownerAccount = await roseDerbyDeterministic.connect(owner);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const raceCaller = await roseDerbyDeterministic.connect(accountThree);
        const winningBettor = await roseDerbyDeterministic.connect(accountFour);
        const organizerTake = 2
        const callerIncentive = 2;
        
        await organizer.scheduleRace(postTime, organizerTake, callerIncentive);
        await organizer.placeBet(0, 0, { value: betAmount }); 
        await winningBettor.placeBet(0, 2, { value: betAmount }); 
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount * BigInt(2));
        
        await time.increaseTo(postTime);
        await raceCaller.determineResults(0);

        const poolAfterTakeout = (race.pool * (BigInt(100) - (BigInt(organizerTake) + BigInt(callerIncentive) + BigInt(ownerTake)))) / BigInt(100);
        const expectedWinnerWinnings = poolAfterTakeout;

        expect(await winningBettor.getWinningsBalance()).to.be.equal(expectedWinnerWinnings);
        expect(await roseDerbyDeterministic.totalWon()).to.equal(poolAfterTakeout);

        await organizer.scheduleRace(postTime + 50, organizerTake, callerIncentive);
        await organizer.placeBet(1, 0, { value: betAmount }); 
        await winningBettor.placeBet(1, 2, { value: betAmount }); 
        
        const race2 = await roseDerbyDeterministic.races(1);
        await time.increaseTo(postTime + 50);
        await raceCaller.determineResults(1);

        const pool2AfterTakeout = (race2.pool * (BigInt(100) - (BigInt(organizerTake) + BigInt(callerIncentive) + BigInt(ownerTake)))) / BigInt(100);
        const expectedWinner2Winnings = pool2AfterTakeout;

        expect(await winningBettor.getWinningsBalance()).to.be.equal(expectedWinnerWinnings + expectedWinner2Winnings);
        expect(await roseDerbyDeterministic.totalWon()).to.equal(poolAfterTakeout + pool2AfterTakeout);
      });

      it("Should transfer the remaining pool to the owner if no winners", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, owner, accountTwo, ownerTake } = await loadFixture(deployRoseDerbyFixture);
        const ownerAccount = await roseDerbyDeterministic.connect(owner);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const organizerTake = 2
        
        await organizer.scheduleRace(postTime, organizerTake, 0);
        await organizer.placeBet(0, 0, { value: betAmount });  
        
        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await organizer.determineResults(0);

        const poolAfterTakeout = (race.pool * (BigInt(100) - (BigInt(organizerTake) + BigInt(ownerTake)))) / BigInt(100);

        const expectedOwnerTakeout = (race.pool * BigInt(ownerTake)) / BigInt(100);
        const expectedOrganizerTakeout = (race.pool * BigInt(organizerTake)) / BigInt(100);
        const expectedRemainderToOwner = poolAfterTakeout;

        expect(await ownerAccount.getWinningsBalance()).to.be.equal(expectedOwnerTakeout + expectedRemainderToOwner);
        expect(await organizer.getWinningsBalance()).to.be.equal(expectedOrganizerTakeout);
        expect(expectedOwnerTakeout + expectedOrganizerTakeout + expectedRemainderToOwner)
          .to.be.equal(race.pool);
      });

      it("Should mark the race as finished", async () => {
        const { roseDerbyNonDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyNonDeterministic.connect(accountTwo);

        await account.scheduleRace(postTime, 5, 5);
        let race = await roseDerbyNonDeterministic.races(0);
        expect(race.finished).to.be.false;

        await time.increaseTo(postTime);

        await account.determineResults(0);
        race = await roseDerbyNonDeterministic.races(0);
        expect(race.finished).to.be.true;
      });

      it("Should allow you to get results on a race", async () => {
        const { roseDerbyDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        await account.scheduleRace(postTime, 5, 5);
        let results = await roseDerbyDeterministic.getResults(0);
        expect(results).to.deep.equal([0n, 0n, 0n, 0n, 0n]);

        await time.increaseTo(postTime);

        await account.determineResults(0);
        results = await roseDerbyDeterministic.getResults(0);
        expect(results).to.deep.equal([2n, 3n, 1n, 0n, 4n]);
      });

      it("Should store the winning horse", async () => {
        const { roseDerbyDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        await account.scheduleRace(postTime, 5, 5);
        let results = await roseDerbyDeterministic.getResults(0);
        expect(results).to.deep.equal([0n, 0n, 0n, 0n, 0n]);
        let race = await roseDerbyDeterministic.races(0);
        expect(race.winner).to.equal(0n)

        await time.increaseTo(postTime);

        await account.determineResults(0);
        results = await roseDerbyDeterministic.getResults(0);
        expect(results).to.deep.equal([2n, 3n, 1n, 0n, 4n]);

        race = await roseDerbyDeterministic.races(0);
        expect(race.winner).to.equal(2n);
      });

      it("Should keep a tally of horse wins", async () => {
        const { roseDerbyDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyDeterministic.connect(accountTwo);

        let horseWins = await roseDerbyDeterministic.getHorseWins();
        expect(horseWins[2]).to.equal(0n);
        
        await account.scheduleRace(postTime, 5, 5);
        await time.increaseTo(postTime);
        await account.determineResults(0);
        
        horseWins = await roseDerbyDeterministic.getHorseWins();
        expect(horseWins[2]).to.equal(1n);

        await account.scheduleRace(postTime + 50, 5, 5);
        await time.increaseTo(postTime + 50);
        await account.determineResults(1);

        horseWins = await roseDerbyDeterministic.getHorseWins();
        expect(horseWins[2]).to.equal(2n);
      });
    });

    describe("Withdrawing winnings", () => {

      it("Should fail if there aren't any funds to withdraw", async () => {
        const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);

        await expect(roseDerby.connect(accountTwo).withdraw())
          .to.be.revertedWith("No funds to withdraw");
      });

      it("Should fail if this contract can't afford the payout", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, owner, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const organizerTake = 2
        
        await organizer.scheduleRace(postTime, organizerTake, 0);
        await organizer.placeBet(0, 0, { value: betAmount }); 

        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await organizer.determineResults(0);

        const expectedOrganizerWinnings = (race.pool * BigInt(organizerTake)) / BigInt(100);
        expect(await organizer.getWinningsBalance()).to.be.equal(expectedOrganizerWinnings);
 
        await roseDerbyDeterministic.burnBalance();

        await expect(organizer.withdraw()).to.be.revertedWith("Insufficient contract balance");
      });

      it("Should zero out their winnings after withdrawal", async () => {
        const betAmount = ethers.parseEther('2');
        const { roseDerbyDeterministic, postTime, accountTwo } = await loadFixture(deployRoseDerbyFixture);
        const organizer = await roseDerbyDeterministic.connect(accountTwo);
        const organizerTake = 2
        
        await organizer.scheduleRace(postTime, organizerTake, 0);
        await organizer.placeBet(0, 0, { value: betAmount }); 

        const race = await roseDerbyDeterministic.races(0);
        expect(race.pool).to.equal(betAmount);
        
        await time.increaseTo(postTime);
        await organizer.determineResults(0);

        const expectedOrganizerWinnings = (race.pool * BigInt(organizerTake)) / BigInt(100);
        expect(expectedOrganizerWinnings).to.be.greaterThan(0);
        expect(await organizer.getWinningsBalance()).to.be.equal(expectedOrganizerWinnings);

        const originalOrganizerBalance = await ethers.provider.getBalance(accountTwo.address);

        const response = await organizer.withdraw();
        const receipt = await response.wait();
        const etherSpentForGas = receipt!.gasUsed * receipt!.gasPrice;

        expect(await organizer.getWinningsBalance()).to.be.equal(0);

        const newOrganizerBalance = await ethers.provider.getBalance(accountTwo.address);
        expect(newOrganizerBalance).to.be.equal(originalOrganizerBalance + expectedOrganizerWinnings - etherSpentForGas);
      });

    });

    describe("Events", function () {
        it("Should emit a race scheduled event on scheduling", async () => {
          const { roseDerby, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
          const account = await roseDerby.connect(accountTwo);

          await expect(await account.scheduleRace(postTime, 5, 5))
                .to.emit(roseDerby, "RaceScheduled")
                .withArgs(0);

          await expect(await account.scheduleRace(postTime, 5, 5))
                .to.emit(roseDerby, "RaceScheduled")
                .withArgs(1);
        });

        it("Should emit a bet placed event on placing a bet", async () => {
          const betAmount = ethers.parseEther('2');
          const { roseDerby, accountTwo } = await loadFixture(deployRoseDerbyFixture);
          const account = await roseDerby.connect(accountTwo);

          const postTime = await time.latest() + 60;
          await account.scheduleRace(postTime, 5, 5);
  
          await expect(account.placeBet(0, 1, { value: betAmount }))
            .to.emit(roseDerby, "BetPlaced")
            .withArgs(0, 1, betAmount);
        });

        it("Should emit a race results determined event on determining results", async () => {
          const { roseDerbyNonDeterministic, accountTwo } = await loadFixture(deployRoseDerbyFixture);
          const account = await roseDerbyNonDeterministic.connect(accountTwo);

          const postTime = await time.latest() + 60;
          await account.scheduleRace(postTime, 5, 5);

          await time.increaseTo(postTime);

          await expect(account.determineResults(0))
            .to.emit(roseDerbyNonDeterministic, "RaceResultsDetermined");
        });
        
      });

  });
  