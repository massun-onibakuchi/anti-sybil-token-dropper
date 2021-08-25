// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./AntiSybilize.sol";

contract Collectible is ERC721URIStorage, AntiSybilize, Ownable {
    constructor(address _proofOfHumanity) ERC721("MyCollective", "COLLECTIVE") AntiSybilize(_proofOfHumanity) {}

    uint256 public startTimestamp;

    function claim(uint256 tokenId) public {
        _verifyAndEffect(msg.sender);
        safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function mint(uint256 tokenId, string memory _tokenURI) public onlyOwner {
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    function setStartTime(uint256 _startTimestamp) public onlyOwner {
        require(_startTimestamp > block.timestamp, "invalid-starttimestamp");
        startTimestamp = _startTimestamp;
    }
}
