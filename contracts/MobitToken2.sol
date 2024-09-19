// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ERC20CappedUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MobitToken2 is 
    Initializable,
    UUPSUpgradeable,
    ERC20Upgradeable,
    ERC20CappedUpgradeable,
    ERC20PermitUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable    
{
    bytes32 public constant CAP_MANAGER_ROLE = keccak256("CAP_MANAGER_ROLE");

    event Airdrop(address indexed to, uint256 amount);

    event Burn(address indexed from, uint256 amount);


    /// @notice Initializes the contract with necessary parameters
    /// @param capManager The address to be granted CAP_MANAGER_ROLE
    /// @param _maxSupply The maximum token supply
    function initialize(
        address capManager,
        uint256 _maxSupply
    ) public initializer {
        __ERC20_init("Mobit Token", "MTK");
        __ERC20Capped_init(_maxSupply);
        __ERC20Permit_init("Mobit Token");
        __AccessControl_init();  
        __UUPSUpgradeable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CAP_MANAGER_ROLE, capManager);
    }

    /// @notice Authorizes contract upgrades
    /// @param newImplementation The address of the new implementation contract
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(CAP_MANAGER_ROLE) {}

    /// @notice Mints tokens to a specified address
    /// @param to The recipient address
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) external nonReentrant onlyRole(CAP_MANAGER_ROLE) {
        _mint(to, amount);
    }

    /// @notice Airdrops tokens to multiple recipients
    /// @param recipients The array of recipient addresses
    /// @param amount The amount of tokens each recipient receives
    function airdrop(address[] calldata recipients, uint256 amount) external whenNotPaused nonReentrant onlyRole(CAP_MANAGER_ROLE) {
        uint256 totalAirdropAmount = recipients.length * amount;
        require(totalSupply() + totalAirdropAmount <= cap(), "Airdrop would exceed max supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amount);
            emit Airdrop(recipients[i], amount);
        }
    }
    
    /// @notice Pauses all token transfers
    function pause() public whenNotPaused onlyRole(CAP_MANAGER_ROLE){
        require(!paused(), "Contract is already paused.");
        _pause();
    }
    
    /// @notice unpause all token transfers
    function unpause() public whenPaused onlyRole(CAP_MANAGER_ROLE){
        require(paused(), "Contract is not paused.");
        _unpause();
    }
    
    /// @notice Burns tokens from a specified address
    /// @param from The address whose tokens are to be burned
    /// @param amount The amount of tokens to burn
    function burn(address from, uint256 amount) external nonReentrant onlyRole(CAP_MANAGER_ROLE) {
    _burn(from, amount);
    emit Burn(from, amount);    
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20CappedUpgradeable) whenNotPaused {
        super._update(from, to, value);
    }


    /// @notice Returns the contract version
    /// @return The version string
    function version() external pure returns (string memory) {
        return "1.3.0";
    }


}
