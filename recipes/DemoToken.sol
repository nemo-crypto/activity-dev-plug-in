// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/// @notice 仅供本地或测试网教学，无追加铸币入口。
contract DemoToken is ERC20 {
    constructor() ERC20("Activity Demo Token", "ADT") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
