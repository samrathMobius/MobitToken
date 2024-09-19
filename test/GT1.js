const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceToken", function () {
    let GovernanceToken, token;
    let owner, council, minter, burner, transferer, user1, user2;

    const decimals = String(18);
    const name = "GovernanceToken";
    const symbol = "GT";
    const actions = {
        canMint: true,
        canBurn: true,
        canPause: true,
        canStake: true,
        canTransfer: true,
        canChangeOwner: true
    };

    beforeEach(async function () {
        [owner, council, minter, burner, transferer, user1, user2] = await ethers.getSigners();
        
        GovernanceToken = await ethers.getContractFactory("GovernanceToken");
        token = await GovernanceToken.deploy(name, symbol, council.address, decimals, actions);

        await token.waitForDeployment();
        console.log("MobitToken deployed to:",await token.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the right name and symbol", async function () {
            expect(await token.name()).to.equal(name);
            expect(await token.symbol()).to.equal(symbol);
            expect(await token.decimals()).to.equal(BigInt(decimals));
        });

        it("Should grant the council address the correct roles", async function () {
            expect(await token.hasRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", council.address)).to.be.true;
            expect(await token.hasRole(token.DEFAULT_ADMIN_ROLE(), council.address)).to.be.true;
        });
    });

    describe("Minting", function () {
        it("Should allow minting if minter role and minting is enabled", async function () {
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);
            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));
            expect(await token.balanceOf(user1.address)).to.equal(ethers.parseUnits("100", BigInt(decimals)));
        });

        it("Should fail to mint if minting is disabled", async function () {
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);
            // await token.connect(council).initializeFeatures({ ...actions, canMint: false }); **********

             expect(
               await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20MintNotEnabled()");
        });
   9

        it("Should fail to mint if the user does not have the minter role", async function () {
            await expect(
                token.connect(user1).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20unAuthorizedRole()");
        });
    });

    describe("Burning", function () {
        it("Should allow burning if burner role and burning is enabled", async function () {
            await token.connect(council).grantRole("0xb7cd08e7968c8eb3cceee719dc902b03ff20ef36607309c7b72f07cdb4dbcd3d", burner.address);
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);

            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));

            await token.connect(burner).burnSupply(user1.address, ethers.parseUnits("50", BigInt(decimals)));
            expect(await token.balanceOf(user1.address)).to.equal(ethers.parseUnits("50", BigInt(decimals)));
        });

        it("Should fail to burn if burning is disabled", async function () {
            await token.connect(council).grantRole("0xb7cd08e7968c8eb3cceee719dc902b03ff20ef36607309c7b72f07cdb4dbcd3d", burner.address);
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);

            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));
            // await token.connect(council).initializeFeatures({ ...actions, canBurn: false }); ***********

            await expect(
                token.connect(burner).burnSupply(user1.address, ethers.parseUnits("50", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20BurnNotEnabled()");
        });

        it("Should fail to burn if the user does not have the burner role", async function () {
            await expect(
                token.connect(user1).burnSupply(user1.address, ethers.parseUnits("50", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20unAuthorizedRole()");
        });
    });

    describe("Transfer", function () {
        it("Should allow transfer if transfer role is assigned and transferring is enabled", async function () {
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);
            await token.connect(council).grantRole("0x60f91c4983cd584ea4c48485b610cc900d867e1f806ae08ae922a90379466d35", transferer.address);
            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));

            await token.connect(user1).approve(transferer.address, ethers.parseUnits("50", BigInt(decimals)));
            await token.connect(transferer).transferFrom(user1.address, user2.address, ethers.parseUnits("50", BigInt(decimals)));

            expect(await token.balanceOf(user2.address)).to.equal(ethers.parseUnits("50", BigInt(decimals)));
        });

        it("Should fail to transfer if transferring is disabled", async function () {
            await token.connect(council).grantRole("0x60f91c4983cd584ea4c48485b610cc900d867e1f806ae08ae922a90379466d35", transferer.address);
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);
            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));
            // await token.connect(council).initializeFeatures({ ...actions, canTransfer: false }); **********

            await expect(
                token.connect(user1).transfer(user2.address, ethers.parseUnits("50", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20TransferNotEnabled()");
        });

        it("Should fail to transfer if user does not have transfer role", async function () {
            await token.connect(council).grantRole("0x262c70cb68844873654dc54487b634cb00850c1e13c785cd0d96a2b89b829472", minter.address);

            await token.connect(minter).mintSupply(user1.address, ethers.parseUnits("100", BigInt(decimals)));
            await expect(
                token.connect(user1).transfer(user2.address, ethers.parseUnits("50", BigInt(decimals)))
            ).to.be.revertedWithCustomError(token, "GovernanceERC20unAuthorizedRole()");
        });
    });

    describe("Pause/Unpause", function () {
        it("Should pause the contract if pause role is enabled", async function () {
            await token.connect(council).pause();
            expect(await token.paused()).to.be.true;
        });

        it("Should fail to pause if pausing is disabled", async function () {
            // await token.connect(council).initializeFeatures({ ...actions, canPause: false }); **********
            await expect(token.connect(council).pause()).to.be.revertedWithCustomError(token, "GovernanceERC20PauseNotEnabled");
        });

        it("Should unpause the contract if pause role is enabled", async function () {
            await token.connect(council).pause();
            await token.connect(council).unpause();
            expect(await token.paused()).to.be.false;
        });

        it("Should fail to unpause if pausing is disabled", async function () {
            // await token.connect(council).initializeFeatures({ ...actions, canPause: false }); *********
            await expect(token.connect(council).pause()).to.be.revertedWithCustomError(token, "GovernanceERC20PauseNotEnabled()");
            await expect(token.connect(council).unpause()).to.be.revertedWithCustomError(token, "GovernanceERC20PauseNotEnabled()");
        });
    });

    describe("Ownership", function () {
        it("Should transfer ownership if ownership change is enabled", async function () {
            await token.connect(council).transferOwnership(user1.address);
            expect(await token.owner()).to.equal(user1.address);
        });

        it("Should fail to transfer ownership if ownership change is disabled", async function () {
// *******       // await token.connect(council).initializeFeatures({ ...actions, canChangeOwner: false });

            await expect(token.connect(council).transferOwnership(user1.address))
                .to.be.revertedWithCustomError(token, "GovernanceERC20ChangeOwnerNotEnabled()");
        });
    });
});
