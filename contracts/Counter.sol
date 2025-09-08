// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;
    event Incremented(address indexed by, uint256 newValue);

    function increment() external {
        count += 1;
        emit Incremented(msg.sender, count);
    }
}
