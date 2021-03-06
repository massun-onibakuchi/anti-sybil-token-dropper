// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./interfaces/IProofOfHumanity.sol";

abstract contract AntiSybilize {
    address public immutable proofOfHumanity;
    mapping(address => bool) public userClaimed;

    constructor(address _proofOfHumanity) {
        proofOfHumanity = _proofOfHumanity;
    }

    function _verifyAndEffect(address receiver) internal {
        _verifyUserClaimable(receiver);
        // effect
        userClaimed[receiver] = true; // flip a flag
    }

    function _verifyUserClaimable(address receiver) internal view {
        require(IProofOfHumanity(proofOfHumanity).isRegistered(receiver), "proof-of-humanity-not-registered"); // check whether a user is registered
        require(!userClaimed[receiver], "can-not-claim-twice"); // receiver can't claim twice
    }

    function isRegistered(address account) public view returns (bool) {
        return IProofOfHumanity(proofOfHumanity).isRegistered(account);
    }

    function isClaimable(address account) external view returns (bool) {
        return isRegistered(account) && !userClaimed[account];
    }
}
