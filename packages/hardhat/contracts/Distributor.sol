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

    address public token;
    DropParam public dropParam;

    event Withdraw(address receiver, uint256 amount);
    event SetDrop(address token, uint256 amount, uint256 startTimestamp, uint256 endTimestamp, uint256 amountPerUser);
    event Claimed(address user, uint256 amount);

    constructor(address _proofOfHumanity) AntiSybilize(_proofOfHumanity) {}

    function claim(address receiver) public {
        DropParam memory param = dropParam;
        require(block.timestamp > param.startTimestamp, "before-claim-start");
        require(param.endTimestamp > block.timestamp, "after-claim-start");
        _verifyAndEffect(receiver);

        uint256 claimAmount = param.dropAmountPerUser;
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= claimAmount, "insufficient-amount-of-token");

        IERC20(token).safeTransfer(receiver, claimAmount);
        emit Claimed(receiver, claimAmount);
    }

    function setDropAmountPerUser(uint256 amountPerUser) public onlyOwner {
        DropParam memory param = dropParam;
        require(amountPerUser > (param.dropAmountPerUser * 8) / 10, "amount-too-small");
        require(block.timestamp > (param.startTimestamp + param.endTimestamp) / 2, "cooling-period");
        dropParam.dropAmountPerUser = amountPerUser;
        emit SetDrop(
            token,
            IERC20(token).balanceOf(address(this)),
            param.startTimestamp,
            param.endTimestamp,
            amountPerUser
        );
    }

    function withdraw() public onlyOwner {
        require(dropParam.endTimestamp > block.timestamp, "during-claim-period");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "amount-zero");
        IERC20(token).safeTransfer(owner(), balance);
        emit Withdraw(owner(), balance);
    }

    function setDrop(
        address _token,
        uint256 _amount,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint256 _dropAmountPerUser
    ) public onlyOwner {
        require(token == address(0), "token-already-set");
        require(_token != address(0), "token-zero-address");
        require(_dropAmountPerUser != 0 && _amount >= _dropAmountPerUser, "invalid-amount");
        require(_startTimestamp > block.timestamp && _endTimestamp > _startTimestamp, "invalid-timestamp");
        token = _token;
        dropParam = DropParam({
            startTimestamp: _startTimestamp,
            endTimestamp: _endTimestamp,
            dropAmountPerUser: _dropAmountPerUser
        });
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        emit SetDrop(_token, _amount, _startTimestamp, _endTimestamp, _dropAmountPerUser);
    }
}
