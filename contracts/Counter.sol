// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    int256 public number;

    event Incremented(address indexed by, int256 newValue);
    event Decremented(address indexed by, int256 newValue);
    event Reset(address indexed by, int256 newValue);

    function incBy(int256 x) external {
        number += x;
        emit Incremented(msg.sender, number);
    }

    function decBy(int256 x) external {
        number -= x;
        emit Decremented(msg.sender, number);
    }

    function reset() external {
        number = 0;
        emit Reset(msg.sender, number);
    }
}
