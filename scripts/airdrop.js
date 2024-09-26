const { ethers } = require("hardhat");

async function main() {
    const mobitTokenAddress = "0x01A8340821D8206f8DA5a5b00f904397CBE1EaF6";
    const MobitTokenV1 = await ethers.getContractFactory("MobitTokenV1");
    const mobitToken = MobitTokenV1.attach(mobitTokenAddress);
  
    // Simulating large airdrop
    const numberOfRecipients = 500;
    let recipients = [];
  
    for (let i = 0; i < numberOfRecipients; i++) {
      recipients.push(ethers.Wallet.createRandom().address);
    }
  
    const airdropAmount = ethers.parseUnits("100", 18);
  
    const tx = await mobitToken.airdrop(recipients, airdropAmount);
    console.log("Airdrop transaction hash:", tx.hash);
    // Airdrop transaction hash on Polygon network: 0x74090ec3366d0b8f97aa276a4dbf04a64b44bb8fe13c9961962df9e00b14428d
  
    const receipt = await tx.wait();
    console.log("Airdrop completed. Gas used:", receipt.gasUsed.toString());

    // Airdrop completed. Gas used: 14218075
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  