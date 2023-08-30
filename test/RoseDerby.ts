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
  
      return { roseDerby, roseDerbyNonDeterministic, roseDerbyDeterministic, owner, accountTwo, accountThree, accountFour, postTime };
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
        const race = await roseDerby._races(0);
        expect(race).to.deep.equal([5, 5, postTime, 0, false]);
      });

      it("Should set the organizer as private race metadata", async () => {
        const { roseDerbyNonDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);

        await roseDerbyNonDeterministic.connect(accountTwo).scheduleRace(postTime, 5, 5);

        const meta = await roseDerbyNonDeterministic.getPrivateRaceMetaByHorseRace(0);
        expect(meta.organizer).to.be.equal(accountTwo.address);
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

        let race = await roseDerby._races(0);
        expect(race.pool).to.equal(0);

        await account.placeBet(0, 1, { value: betAmount });

        race = await roseDerby._races(0);
        expect(race.pool).to.equal(betAmount);
      });

      //if (_totalBetByBettorByHorseByRace[index][horse][msg.sender] == 0) {
      //    _betDataByHorseByRace[index][horse].bettors.push(msg.sender);
      //}

      //_totalBetByBettorByHorseByRace[index][horse][msg.sender] += msg.value;

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

      // HorseBetData memory winningHorseBetData = _betDataByHorseByRace[index][winningHorse];

      // winnings[owner] += race.pool * (OWNER_TAKE / 100);
      // winnings[_meta[index].organizer] += race.pool * (race.take / 100);
      // winnings[msg.sender] += race.pool * (race.callerIncentive / 100);

      // _races[index].pool = _races[index].pool * (1 - ((OWNER_TAKE + race.take + race.callerIncentive) / 100));

      // for (uint i = 0; i < winningHorseBetData.bettors.length; i++) {
      //     address winner = winningHorseBetData.bettors[i];
      //     uint winnerProportion = _totalBetByBettorByHorseByRace[index][winningHorse][winner] / winningHorseBetData.totalAmountBet;
      //     winnings[winner] += winnerProportion * _races[index].pool;
      // }

      it("Should increase the owner's winnings by the owner take proportion", async () => {
        expect.fail();
      });

      it("Should increase the organizer's winnings by the organizer take proportion", async () => {
        expect.fail();
      });

      it("Should increase the caller's winnings by the caller incentive proportion", async () => {
        expect.fail();
      });

      it("Should increase all the winning address's winnings proportional to the bets on the winning horse", async () => {
        expect.fail();
      });

      it("Shouldn't allow negative takes/incentives at all, go back and look at that.", async () => {
        expect.fail();
      });

      it("Should mark the race as finished", async () => {
        const { roseDerbyNonDeterministic, accountTwo, postTime } = await loadFixture(deployRoseDerbyFixture);
        const account = await roseDerbyNonDeterministic.connect(accountTwo);

        await account.scheduleRace(postTime, 5, 5);
        let race = await roseDerbyNonDeterministic._races(0);
        expect(race.finished).to.be.false;

        await time.increaseTo(postTime);

        await account.determineResults(0);
        race = await roseDerbyNonDeterministic._races(0);
        expect(race.finished).to.be.true;
      });
    });

    describe("Withdrawing winnings", () => {

      it("Should fail if there aren't any funds to withdraw", async () => {
        expect.fail();
      });

      it("Should fail if this contract can't afford the payout", async () => {
        expect.fail();
      });

      it("Should zero out their winnings after withdrawal", async () => {
        expect.fail();
      });

      it("Should transfer the winnings in ROSE from the contract to the withdrawer", async () => {
        expect.fail();
      });
    //   function withdraw() external {
    //     uint amount = winnings[msg.sender];
        
    //     require(amount > 0, "No funds to withdraw");
    //     require(address(this).balance >= amount, "Insufficient contract balance");

    //     winnings[msg.sender] = 0;

    //     (bool success, ) = msg.sender.call{value: amount}("");
    //     require(success, "Transfer failed.");
    // }

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
  