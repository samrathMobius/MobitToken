const { ethers, upgrades } = require("hardhat");

const PROXY = "0x3EfeF7ED92591556AA35812C6340E3dEB83ab692"

async function main() {
 const MobitTokenV1 = await ethers.getContractFactory("MobitTokenV1");
 console.log("Upgrading MobitTokenV1...");
 await upgrades.upgradeProxy(PROXY, MobitTokenV1);
 console.log("MobitTokenV1 upgraded successfully");
}

main();