// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./MobitToken.sol";

contract MaliciousContract {
    MobitToken public token;
    address public capManager;

    constructor(address _tokenAddress, address _capManager) {
        token = MobitToken(_tokenAddress);
        capManager = _capManager;
    }

    function attack(address target, uint256 amount) external {
        // Try to re-enter the mint function by calling it recursively
        token.mint(target, amount);
    }

    // Fallback function to trigger reentrancy
    fallback() external {
        token.mint(msg.sender, 1); // This will fail due to ReentrancyGuard
    }
}
