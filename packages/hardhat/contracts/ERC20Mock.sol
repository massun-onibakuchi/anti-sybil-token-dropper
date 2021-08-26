// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract ERC20Mock is ERC20("ERC20Mock", "ERC20MOCK") {
    uint8 private _decimals;

    function setDecimals(uint8 newDecimals) public {
        _decimals = newDecimals;
        console.log("decimals:", _decimals);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
