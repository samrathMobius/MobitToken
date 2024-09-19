const { ethers, upgrades } = require("hardhat");

const PROXY = "0x981760885AF9d6bb09eF09895478B57d789201dC"

async function main() {
 const MobitTokenV1 = await ethers.getContractFactory("MobitTokenV1");
 console.log("Upgrading MobitTokenV1...");
 await upgrades.upgradeProxy(PROXY, MobitTokenV1);
 console.log("MobitTokenV1 upgraded successfully");
}

main();