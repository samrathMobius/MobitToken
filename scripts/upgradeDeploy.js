const { ethers, upgrades } = require("hardhat");

const PROXY = "0x01A8340821D8206f8DA5a5b00f904397CBE1EaF6" // polygon amoy

async function main() {
 const MobitTokenV1 = await ethers.getContractFactory("MobitTokenV1");
 console.log("Upgrading MobitTokenV1...");
 await upgrades.upgradeProxy(PROXY, MobitTokenV1);
 console.log("MobitTokenV1 upgraded successfully");
}

main();