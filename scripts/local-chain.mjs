import { readFile } from 'node:fs/promises';
import ganache from 'ganache';
import solc from 'solc';
import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
export async function startChain(port = 0) {
  // 固定教学助记词仅用于无价值本地链，绝不能用于真实资产。
  const server = ganache.server({
    chain: { chainId: 31337, hardfork: 'shanghai' },
    wallet: { mnemonic: 'test test test test test test test test test test test junk' },
    logging: { quiet: true },
  });
  await server.listen(port, '127.0.0.1');
  try {
    const rpc = `http://127.0.0.1:${server.address().port}`;
    const chain = defineChain({
      id: 31337,
      name: 'Activity Local',
      nativeCurrency: { name: 'Test Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpc] } },
    });
    const client = createPublicClient({ chain, transport: http() });
    const wallet = createWalletClient({ chain, transport: http() });
    const [account] = await wallet.getAddresses();
    const source = await readFile(new URL('../contracts/Counter.sol', import.meta.url), 'utf8');
    const output = JSON.parse(
      solc.compile(
        JSON.stringify({
          language: 'Solidity',
          sources: { 'Counter.sol': { content: source } },
          settings: {
            evmVersion: 'shanghai',
            outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
          },
        }),
      ),
    );
    const errors = output.errors?.filter((x) => x.severity === 'error');
    if (errors?.length) throw new Error(errors.map((x) => x.formattedMessage).join('\n'));
    const compiled = output.contracts['Counter.sol'].Counter;
    const bytecode = `0x${compiled.evm.bytecode.object}`;
    const gas = await client.estimateGas({ account, data: bytecode });
    const hash = await wallet.deployContract({ account, abi: compiled.abi, bytecode, gas });
    const receipt = await client.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success' || !receipt.contractAddress) throw new Error('部署失败');
    return {
      server,
      client,
      wallet,
      account,
      address: receipt.contractAddress,
      abi: compiled.abi,
      rpc,
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}
