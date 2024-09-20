const { ethers, upgrades } = require("hardhat");

async function main() {
  // The contract factory for the MobitToken contract
  const MobitToken = await ethers.getContractFactory("MobitToken");

  const capManagerAddress = "0x717cbCF10015709A38c9429F8b2626129896B369";
  const maxSupply = ethers.parseEther("100000000"); // 100 million tokens

  // Deploy the contract using OpenZeppelin upgrades plugin with an initializer
  const mobitToken = await upgrades.deployProxy(MobitToken, [capManagerAddress, maxSupply], {
    initializer: "initialize"
  });

  console.log("MobitToken deployed to:", mobitToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
