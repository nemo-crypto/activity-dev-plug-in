import { defineChain, parseAbi } from 'viem';
export const localChain = defineChain({ id: 31337, name: 'Activity Local', nativeCurrency: { name: 'Test Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } } });
export const counterAbi = parseAbi(['function count() view returns (uint256)', 'function increment() external', 'event Incremented(address indexed caller, uint256 count)']);
