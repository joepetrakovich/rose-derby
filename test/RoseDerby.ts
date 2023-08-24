import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";

  describe("HorseRace", function () {

    async function deployRoseDerbyFixture() {
      //common race scheduled 1 hour later
      const postTime = (await time.latest()) + 60 * 60;

      const [owner, otherAccount] = await ethers.getSigners();
  
      const RoseDerby = await ethers.getContractFactory("RoseDerby");
      const roseDerby = await RoseDerby.deploy();
  
      return { roseDerby, owner, otherAccount, postTime };
    }
  
    describe("Deployment", () => {
      it("Should start with a zero balance", async () => {
        const { roseDerby } = await loadFixture(deployRoseDerbyFixture);

        expect(await ethers.provider.getBalance(roseDerby.target)).to.equal(0);
      });
    });

    describe("Scheduling races", () => {
      it("Shouldn't allow a takout amount greater than 100%", async () => {
        const { roseDerby, otherAccount, postTime } = await loadFixture(deployRoseDerbyFixture);

        await expect(roseDerby.connect(otherAccount)
                              .scheduleRace(postTime, 97, 2))
              .to.be.revertedWith("Takeout adds up to more than 100%");
      });

      it("Should set the right values on a new race and add it to the races array", async () => {
        const { roseDerby, otherAccount, postTime } = await loadFixture(deployRoseDerbyFixture);

        await roseDerby.connect(otherAccount)
                       .scheduleRace(postTime, 5, 5);
        const race = await roseDerby._races(0);
        expect(race).to.deep.equal([5, 5, postTime, 0, false]);
      });
    });

    describe("Placing bets", () => {});

    describe("Determining race results", () => {});

    describe("Withdrawing winnings", () => {});

    describe("Events", function () {
        it("Should emit a race scheduled event on scheduling", async () => {
          const { roseDerby, otherAccount, postTime } = await loadFixture(deployRoseDerbyFixture);

          await expect(await roseDerby.connect(otherAccount)
                                      .scheduleRace(postTime, 5, 5))
                .to.emit(roseDerby, "RaceScheduled")
                .withArgs(0);

          await expect(await roseDerby.connect(otherAccount)
                                      .scheduleRace(postTime, 5, 5))
                .to.emit(roseDerby, "RaceScheduled")
                .withArgs(1);
        });
      });
  });
  