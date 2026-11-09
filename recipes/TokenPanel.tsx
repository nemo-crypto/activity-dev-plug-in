// 放在 recipes/RainbowKit.tsx 的 Provider 内。依赖 wagmi@2、viem@2。
import { useAccount, useReadContract, usePublicClient, useWriteContract } from 'wagmi';
import { erc20Abi, formatUnits, parseUnits, isAddress, zeroAddress, type Address } from 'viem';
import { useState } from 'react';
import { sepolia } from 'wagmi/chains';
export function TokenPanel({ token }: { token: Address }) {
  const { address, chainId } = useAccount(); const client = usePublicClient({ chainId: sepolia.id }); const { writeContractAsync } = useWriteContract();
  const [spender, setSpender] = useState(''), [amount, setAmount] = useState('1'), [status, setStatus] = useState(''), [busy, setBusy] = useState(false);
  const decimals = useReadContract({ address: token, abi: erc20Abi, functionName: 'decimals', chainId: sepolia.id });
  const balance = useReadContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: address ? [address] : undefined, chainId: sepolia.id, query: { enabled: !!address } });
  async function approve() {
    setBusy(true);
    try {
      if (!client || !address || chainId !== sepolia.id || decimals.data === undefined) throw new Error('连接 Sepolia 钱包并等待精度读取');
      if (!isAddress(spender) || spender === zeroAddress) throw new Error('请输入非零 spender 地址');
      if (!/^\d+(\.\d+)?$/.test(amount) || (amount.split('.')[1]?.length || 0) > decimals.data) throw new Error('数量格式或小数精度不正确');
      const value = parseUnits(amount, decimals.data); // 不用浮点数，不做无限授权；0 表示撤销。
      setStatus('正在模拟授权');
      const { request } = await client.simulateContract({ account: address, address: token, abi: erc20Abi, functionName: 'approve', args: [spender, value] });
      const hash = await writeContractAsync(request); setStatus(`等待确认 ${hash}`);
      const receipt = await client.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error('授权回滚');
      const allowance = await client.readContract({ address: token, abi: erc20Abi, functionName: 'allowance', args: [address, spender] });
      setStatus(`已确认授权额度：${formatUnits(allowance, decimals.data)}`);
    } catch(e) { setStatus((e as Error).message); } finally { setBusy(false); }
  }
  return <section><p>余额：{balance.data !== undefined && decimals.data !== undefined ? formatUnits(balance.data, decimals.data) : '—'}</p><label>授权对象<input value={spender} onChange={e => setSpender(e.target.value)}/></label><label>额度（0 撤销）<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"/></label><button disabled={busy} onClick={() => void approve()}>模拟并确认精确授权</button><p role="status">{status}</p><p>此示例面向 DemoToken；某些代币变更非零额度前要求先确认一笔 approve(0)。</p></section>;
}
