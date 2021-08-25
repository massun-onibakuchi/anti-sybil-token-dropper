// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../interfaces/IProofOfHumanity.sol";

contract ProofOfHumanMock is IProofOfHumanity {
    mapping(address => bool) private _isRegistered;

    function isRegistered(address _submissionID) external view override returns (bool) {
        return true;
    }
}
