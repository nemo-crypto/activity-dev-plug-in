import { useEffect, useRef, useState } from 'react';
import { createPublicClient, createWalletClient, custom, http, isAddress, type Address, type EIP1193Provider } from 'viem';
import { counterAbi, localChain } from '../lib/contract';
type Provider = EIP1193Provider & { on?: (event: string, cb: (...args: any[]) => void) => void; removeListener?: (event: string, cb: (...args: any[]) => void) => void };
type Wallet = { info: { uuid: string; name: string }; provider: Provider };
const client = createPublicClient({ chain: localChain, transport: http(undefined, { timeout: 8000, retryCount: 0 }) });
export function WalletDemo() {
  const [wallets, setWallets] = useState<Wallet[]>([]), [selected, setSelected] = useState<Wallet>();
  const [account, setAccount] = useState<Address>(), [chain, setChain] = useState<number>();
  const [address, setAddress] = useState(import.meta.env.VITE_COUNTER_ADDRESS || '');
  const [count, setCount] = useState<string>('—'), [status, setStatus] = useState('等待连接钱包'), [busy, setBusy] = useState(false);
  const [hash, setHash] = useState('');
  const generation = useRef(0);
  useEffect(() => {
    function announce(e: Event) { const detail = (e as CustomEvent<Wallet>).detail; if (!detail?.info?.uuid || !detail.provider?.request) return; setWallets(old => old.some(w => w.info.uuid === detail.info.uuid) ? old : [...old, detail]); }
    window.addEventListener('eip6963:announceProvider', announce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    const legacy = (window as Window & { ethereum?: Provider }).ethereum;
    if (legacy) setWallets(old => old.length ? old : [{ info: { uuid: 'legacy', name: '浏览器钱包' }, provider: legacy }]);
    return () => window.removeEventListener('eip6963:announceProvider', announce);
  }, []);
  useEffect(() => {
    if (!selected) return;
    const changed = (accounts: string[]) => { generation.current++; setAccount(accounts[0] && isAddress(accounts[0]) ? accounts[0] as Address : undefined); setHash(''); setStatus('钱包账户已变更'); };
    const chainChanged = (id: string) => { generation.current++; setChain(Number(id)); setHash(''); setStatus('钱包网络已变更'); };
    const disconnect = () => { generation.current++; setAccount(undefined); setChain(undefined); setStatus('钱包已断开'); };
    selected.provider.on?.('accountsChanged', changed); selected.provider.on?.('chainChanged', chainChanged); selected.provider.on?.('disconnect', disconnect);
    return () => { selected.provider.removeListener?.('accountsChanged', changed); selected.provider.removeListener?.('chainChanged', chainChanged); selected.provider.removeListener?.('disconnect', disconnect); };
  }, [selected]);
  useEffect(() => () => { generation.current++; }, []);
  async function run(action: () => Promise<void>) { setBusy(true); try { await action(); } catch(e) { setStatus((e as { shortMessage?: string; message?: string }).shortMessage || (e as Error).message); } finally { setBusy(false); } }
  async function connect(wallet: Wallet) {
    generation.current++; setSelected(wallet); setAccount(undefined); setChain(undefined); setHash('');
    const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
    const id = await wallet.provider.request({ method: 'eth_chainId' });
    setAccount(accounts[0]); setChain(Number(id)); setStatus('已连接，可切换至本地链');
  }
  async function switchChain() {
    if (!selected) throw new Error('请先连接钱包');
    try { await selected.provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x7a69' }] }); }
    catch(e) { if ((e as { code: number }).code !== 4902) throw e; await selected.provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x7a69', chainName: localChain.name, nativeCurrency: localChain.nativeCurrency, rpcUrls: ['http://127.0.0.1:8545'] }] }); }
    setChain(Number(await selected.provider.request({ method: 'eth_chainId' }))); setStatus('已请求切换网络');
  }
  function contractAddress(): Address { if (!isAddress(address)) throw new Error('请输入有效合约地址'); return address; }
  async function read() { const value = await client.readContract({ address: contractAddress(), abi: counterAbi, functionName: 'count' }); setCount(String(value)); setStatus('已从本地 RPC 读取计数'); }
  async function write() {
    if (!selected || !account) throw new Error('请先连接钱包');
    const id = Number(await selected.provider.request({ method: 'eth_chainId' }));
    if (id !== localChain.id) throw new Error('仅允许在本地测试链 31337 发送交易');
    const wallet = createWalletClient({ chain: localChain, transport: custom(selected.provider) });
    const version = generation.current;
    setHash(''); setStatus('正在模拟交易…');
    const { request } = await client.simulateContract({ address: contractAddress(), abi: counterAbi, functionName: 'increment', account });
    if (version !== generation.current) throw new Error('账户或网络已变化，请重试');
    setStatus('请在钱包确认 increment 交易（不转账）');
    const tx = await wallet.writeContract(request); setHash(tx); setStatus('交易已广播，等待区块确认…');
    const receipt = await client.waitForTransactionReceipt({ hash: tx, timeout: 60000 });
    if (receipt.status !== 'success') throw new Error('交易执行回滚');
    if (version !== generation.current) return;
    await read(); setStatus(`交易成功，区块 ${receipt.blockNumber}`);
  }
  return <div className="wallet-layout"><div><span className="tag">EIP-6963 · EIP-1193 · Viem</span><h3>连接你的浏览器钱包</h3><p>PC 扩展或移动钱包内置浏览器。普通手机浏览器请参考 WalletConnect 接入配方。</p><div className="row">{wallets.map(w => <button disabled={busy} key={w.info.uuid} onClick={() => void run(() => connect(w))}>连接 {w.info.name}</button>)}</div>{!wallets.length && <p className="notice">未发现钱包。安装扩展或用钱包内置浏览器打开；无需钱包也可以读取已部署的本地合约。</p>}<p className="mono">账户：{account || '未连接'}<br/>网络：{chain || '—'}</p><div className="row"><button disabled={!account || busy} onClick={() => void run(switchChain)}>切换本地链</button><button disabled={!selected || busy} className="secondary" onClick={() => { generation.current++; setSelected(undefined); setAccount(undefined); setChain(undefined); setHash(''); setStatus('已清除本站连接状态；钱包授权可在钱包中撤销'); }}>断开本站连接</button></div></div><div><label>Counter 合约地址<input placeholder="0x…" value={address} disabled={busy} onChange={e => { setAddress(e.target.value); setCount('—'); setHash(''); }}/></label><div className="metric">{count}<small>链上计数</small></div><div className="row"><button disabled={busy} onClick={() => void run(read)}>读取 count</button><button disabled={busy || !account || chain !== 31337} onClick={() => void run(write)}>模拟并提交 +1</button></div><p role="status" className="status">{status}</p>{hash && <p className="mono">交易：{hash}</p>}<p>先运行 <code>npm run chain</code>，复制部署地址。本地链重启后数据重置。</p></div></div>;
}
