// require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    Amoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
 etherscan: {
  apiKey: {
    Amoy: "ZXMSW7V7BPRKY1C55ZQGEXNJBYV4VC9N5D"
  },
  customChains: [
    {
      network: "Amoy",
      chainId: 80002,
      urls: {
        apiURL: "https://api-amoy.polygonscan.com/api",
        browserURL: "https://polygon-amoy.drpc.org"
      }
    }
  ]
}
};
