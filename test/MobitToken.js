const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MobitToken2.o", function () {
  let MobitTokenFactory;
  let mobitToken;
  let MaliciousContract;
  let maliciousContract;
  let owner, capManager, attacker, addr1, addr2, addrs;
  const MAX_SUPPLY = ethers.parseUnits("1000000", 18); // 1,000,000 MTK
  console.log(MAX_SUPPLY);


  beforeEach(async function () {
    [owner, capManager, attacker, addr1, addr2, ...addrs] = await ethers.getSigners();

    const MobitTokenFactory = await ethers.getContractFactory("MobitToken");
    mobitToken = await MobitTokenFactory.deploy();

    // await mobitToken.deployed();
    await mobitToken.initialize(capManager.address, MAX_SUPPLY);

    console.log("MobitToken deployed to:", mobitToken.target);

       // Deploy the malicious contract
       const MaliciousContractFactory = await ethers.getContractFactory("MaliciousContract");
       maliciousContract = await MaliciousContractFactory.deploy(mobitToken, capManager);
      //  await maliciousContract.deployed();
       console.log("maliciousContract deployed to:", maliciousContract.target);

  });

  it("should have correct name, symbol, and cap", async function () {
    expect(await mobitToken.name()).to.equal("Mobit Token");
    expect(await mobitToken.symbol()).to.equal("MTK");
    expect(await mobitToken.cap()).to.equal(MAX_SUPPLY);
  });

  it("should mint tokens to the specified address by the cap manager", async function () {
    const mintAmount = ethers.parseUnits("1000", 18); // 1000 MTK
    await mobitToken.connect(capManager).mint(addr1.address, mintAmount);

    expect(await mobitToken.balanceOf(addr1.address)).to.equal(mintAmount);
  });
  
  it("should revert when minting more than the cap", async function () {
    const overCapAmount = MAX_SUPPLY + (ethers.parseUnits("1", 18)); // Max supply + 1 MTK
  
    // Try to mint more than the cap, expect custom revert with error
    await expect(
      mobitToken.connect(capManager).mint(addr1.address, overCapAmount)
    ).to.be.revertedWithCustomError(mobitToken, "ERC20ExceededCap")
      .withArgs(overCapAmount, MAX_SUPPLY);
  });

  it("should not mint tokens if caller is not cap manager", async function () {
    const mintAmount = ethers.parseUnits("1000", 18); // 1000 MTK
    await expect(
        mobitToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(mobitToken, "AccessControlUnauthorizedAccount")
        .withArgs(addr1.address, "0x027f9f680a0c6704fd9796b55c67fe885252243966ecb05a88f3e7873c845d9a");
  });

  it("should airdrop tokens to multiple recipients", async function () {
    const airdropAmount = ethers.parseUnits("100", 18); // 100 MTK each
    const recipients = [addr1.address, addr2.address];

    await mobitToken.connect(capManager).airdrop(recipients, airdropAmount);

    expect(await mobitToken.balanceOf(addr1.address)).to.equal(airdropAmount);
    expect(await mobitToken.balanceOf(addr2.address)).to.equal(airdropAmount);
  });

  it("should emit Airdrop event during airdrop", async function () {
    const airdropAmount = ethers.parseUnits("100", 18); // 100 MTK each
    const recipients = [addr1.address, addr2.address];
  
    await expect(mobitToken.connect(capManager).airdrop(recipients, airdropAmount))
      .to.emit(mobitToken, "Airdrop")
      .withArgs(addr1.address, airdropAmount)
      .and.to.emit(mobitToken, "Airdrop")
      .withArgs(addr2.address, airdropAmount);
  });

  it("should not exceed max supply during airdrop", async function () {
    const airdropAmount = ethers.parseUnits("1000000", 18); // 1,000,000 MTK per recipient
    const recipients = [addr1.address, addr2.address];

    await expect(
      mobitToken.connect(capManager).airdrop(recipients, airdropAmount)
    ).to.be.revertedWith("Airdrop would exceed max supply");
  });

  it("should approve allowance and allow transferFrom to spend tokens", async function () {
    const mintAmount = ethers.parseUnits("1000", 18); // 1000 MTK
    const transferAmount = ethers.parseUnits("200", 18); // 200 MTK

    // Cap manager mints tokens to addr1
    await mobitToken.connect(capManager).mint(addr1.address, mintAmount);

    // addr1 approves addr2 to spend 200 MTK on their behalf
    await mobitToken.connect(addr1).approve(addr2.address, transferAmount);

    // Check allowance
    expect(await mobitToken.allowance(addr1.address, addr2.address)).to.equal(transferAmount);

    // addr2 transfers 200 MTK from addr1 to addr2
    await mobitToken.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount);

    // Verify balances
    expect(await mobitToken.balanceOf(addr1.address)).to.equal(mintAmount - transferAmount);
    expect(await mobitToken.balanceOf(addr2.address)).to.equal(transferAmount);

    // Check the remaining allowance (should be 0 after full transfer)
    expect(await mobitToken.allowance(addr1.address, addr2.address)).to.equal(0);
  });


  it("should burn tokens", async function () {
    const mintAmount = ethers.parseUnits("500", 18); // 500 MTK
    const burnAmount = ethers.parseUnits("200", 18); // 200 MTK

    await mobitToken.connect(capManager).mint(addr1.address, mintAmount);
    await mobitToken.connect(capManager).burn(addr1.address, burnAmount);

    expect(await mobitToken.balanceOf(addr1.address)).to.equal(mintAmount - (burnAmount));
  });

  it("should emit Burn event during token burning", async function () {
    const mintAmount = ethers.parseUnits("1000", 18); // 1000 MTK
    const burnAmount = ethers.parseUnits("500", 18); // 500 MTK
  
    await mobitToken.connect(capManager).mint(addr1.address, mintAmount);
  
    await expect(mobitToken.connect(capManager).burn(addr1.address, burnAmount))
      .to.emit(mobitToken, "Burn")
      .withArgs(addr1.address, burnAmount);
  });

  it("should only allow the cap manager to pause and unpause the contract", async function () {
    // Cap manager pauses the contract
    await mobitToken.connect(capManager).pause();
    expect(await mobitToken.paused()).to.equal(true);

    // addr1 (non-manager) tries to pause, should fail
    await expect(mobitToken.connect(addr1).pause())
    .to.be.revertedWithCustomError(mobitToken,"EnforcedPause()");
  
    // Cap manager unpauses the contract
    await mobitToken.connect(capManager).unpause();
    expect(await mobitToken.paused()).to.equal(false);
  });
  
  it("should pause and unpause transfers", async function () {
    const mintAmount = ethers.parseUnits("1000", 18); // 1000 MTK
    await mobitToken.connect(capManager).mint(addr1.address, mintAmount);

    await mobitToken.connect(capManager).pause();
    await expect(
      mobitToken.connect(addr1).transfer(addr2.address, mintAmount)
    ).to.be.revertedWithCustomError(mobitToken,"EnforcedPause()");

    await mobitToken.connect(capManager).unpause();
    await expect(mobitToken.connect(addr1).transfer(addr2.address, mintAmount))
      .to.emit(mobitToken, "Transfer")
      .withArgs(addr1.address, addr2.address, mintAmount);
  });

  it("should prevent reentrancy attack on mint function", async function () {

    // Try to execute a reentrancy attack
    await expect(
      maliciousContract.connect(attacker).attack(addr1.address, ethers.parseUnits("100", 18))
    ).to.be.revertedWithCustomError(mobitToken, "AccessControlUnauthorizedAccount")
        .withArgs(maliciousContract, "0x027f9f680a0c6704fd9796b55c67fe885252243966ecb05a88f3e7873c845d9a");
  });
  
});

// cap Manger bytes32: 0x027f9f680a0c6704fd9796b55c67fe885252243966ecb05a88f3e7873c845d9a