import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeEventLog } from 'viem';
import { startChain } from '../scripts/local-chain.mjs';
test('Counter 完整生命周期：部署、读取、模拟、广播、确认、事件、回滚', async () => {
  const { server, client, wallet, account, address, abi } = await startChain();
  try {
    assert.equal(await client.getChainId(), 31337);
    assert.equal(await client.readContract({ address, abi, functionName: 'count' }), 0n);
    const { request } = await client.simulateContract({
      address,
      abi,
      functionName: 'increment',
      account,
    });
    assert.equal(
      await client.readContract({ address, abi, functionName: 'count' }),
      0n,
      '模拟不应修改状态',
    );
    const hash = await wallet.writeContract(request);
    const receipt = await client.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, 'success');
    assert.equal(await client.readContract({ address, abi, functionName: 'count' }), 1n);
    const event = decodeEventLog({ abi, ...receipt.logs[0] });
    assert.equal(event.eventName, 'Incremented');
    assert.equal(event.args.count, 1n);
    await assert.rejects(
      client.simulateContract({ address, abi, functionName: 'increment', account, value: 1n }),
    );
    const invalidHash = await wallet.sendTransaction({
      account,
      to: address,
      data: '0xdeadbeef',
      gas: 100000n,
    });
    assert.equal(
      (await client.waitForTransactionReceipt({ hash: invalidHash })).status,
      'reverted',
    );
    assert.equal(await client.readContract({ address, abi, functionName: 'count' }), 1n);
  } finally {
    await server.close();
  }
});
