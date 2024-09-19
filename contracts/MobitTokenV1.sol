// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contract MobitTokenV1 is 
    Initializable,
    UUPSUpgradeable,
    ERC20Upgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable,
    AccessControlUpgradeable    
{
    uint256 public maxSupply;
    bytes32 public constant CAP_MANAGER_ROLE = keccak256("CAP_MANAGER_ROLE");

    event Airdrop(address indexed to, uint256 amount);

    function initialize(
        address capManager,
        uint256 _maxSupply
    ) public initializer {
        __ERC20_init("Mobit Token", "MTK");
        __ERC20Permit_init("Mobit Token");
        __AccessControl_init();  
        __UUPSUpgradeable_init();

        maxSupply = _maxSupply;

        // Assign the Cap Manager role to the capManager address
        _grantRole(CAP_MANAGER_ROLE, capManager);
    }

    // Override _authorizeUpgrade for UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(CAP_MANAGER_ROLE) {}

    /// @notice Mints tokens to a specified address
    function mint(address to, uint256 amount) external onlyRole(CAP_MANAGER_ROLE) {
        uint256 currentSupply = totalSupply();
        require(currentSupply + amount <= maxSupply, "Mint would exceed max supply");

        _mint(to, amount);
    }

    /// @notice Airdrop function to distribute tokens
    function airdrop(address[] calldata recipients, uint256 amount) external onlyRole(CAP_MANAGER_ROLE) {
        uint256 currentSupply = totalSupply();
        uint256 totalAirdropAmount = recipients.length * amount;
        require(currentSupply + totalAirdropAmount <= maxSupply, "Airdrop would exceed max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amount);
            emit Airdrop(recipients[i], amount);
        }
    }

    function pause() public  whenNotPaused onlyRole(CAP_MANAGER_ROLE){
        require(!paused(), "Contract is already paused.");
        _pause();
    }

    function unpause() public whenPaused onlyRole(CAP_MANAGER_ROLE){
        require(paused(), "Contract is not paused.");
        _unpause();
    }

     function version() external pure returns (string memory) {
        return "0.0.2";
    }
}

//SEPOLIA address = 0x5C77774b41Cf0ccc25F2A3d6465ff72D29F7aD56