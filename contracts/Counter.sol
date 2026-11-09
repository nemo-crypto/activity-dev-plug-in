// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice UI 教学合约：无资金托管，每次递增必须经过真实交易确认。
contract Counter {
    uint256 public count;
    event Incremented(address indexed caller, uint256 count);
    function increment() external {
        count += 1;
        emit Incremented(msg.sender, count);
    }
}
