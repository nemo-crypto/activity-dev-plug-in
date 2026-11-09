import { startChain } from './local-chain.mjs';
const { server, rpc, address, account } = await startChain(8545);
console.log(
  `本地教学链已启动：${rpc}\nChain ID: 31337\nCounter: ${address}\n测试账户: ${account}\n\n在网页输入 Counter 地址，或在 .env.local 中设置：\nVITE_COUNTER_ADDRESS=${address}\n\n钱包测试助记词（公开测试数据，仅本地无价值资产）：\ntest test test test test test test test test test test junk\n\n停止后链上状态将丢失。`,
);
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await server.close();
  process.exit(0);
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
