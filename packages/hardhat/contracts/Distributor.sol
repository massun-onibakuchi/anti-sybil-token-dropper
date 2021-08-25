// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./AntiSybilize.sol";

contract Distributor is AntiSybilize, Ownable {
    using SafeERC20 for IERC20;

    struct DropParam {
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 dropAmountPerUser;
    }

    DropParam public dropParam;

    constructor(address _proofOfHumanity) AntiSybilize(_proofOfHumanity) {}

    function claim(address token, address receiver) public {
        _verifyAndEffect(token, receiver);
        uint256 claimAmount = dropParam.dropAmountPerUser;
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(claimAmount >= balance, "insufficient-amount-of-token");

        IERC20(token).safeTansfer(receiver, claimAmount);
    }

    function setDropAmountPerUser(uint256 amountPerUser) public onlyOwner {
        require(amountPerUser > 0,"amount-zero");
        dropPara.dropAmountPerUser = amountPerUser;
    }

    function setDrop(
        address token,
        uint256 amount,
        uint256 startTimestamp,
        uint256 endTimestamp,
        uint256 dropAmountPerUser
    ) public onlyOwner {
        require(token != address(0), "token-zero-address");
        require(dropAmountPerUser != 0 && amount >= dropAmountPerUser, "invalid-amount");
        require(startTimestamp > block.timestamp && endTimestamp > startTimestamp, "invalid-timestamp");

        dropParam = DropParam({
            startTimestamp: startTimeStamp,
            endTimestamp: endTimestamp,
            dropAmountPerUser: dropAmountPerUser
        });
        IERC20(token).safeTansferFrom(msg.sender, address(this), amount);
    }
}
