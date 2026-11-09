// 独立工程依赖：@tonconnect/ui-react @ton/core
import {
  TonConnectUIProvider,
  TonConnectButton,
  useTonWallet,
  useTonConnectUI,
  CHAIN,
} from '@tonconnect/ui-react';
import { Address, toNano } from '@ton/core';
import { useState } from 'react';
function Transfer() {
  const wallet = useTonWallet();
  const [ui] = useTonConnectUI();
  const [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false);
  const [recipient, setRecipient] = useState('');
  async function send() {
    setBusy(true);
    try {
      if (wallet?.account.chain !== CHAIN.TESTNET) throw new Error('请先连接 TON Testnet 钱包');
      const address = Address.parse(recipient).toString({ testOnly: true });
      setStatus('等待钱包确认');
      await ui.sendTransaction({
        network: CHAIN.TESTNET,
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address, amount: toNano('0.01').toString() }],
      });
      setStatus('钱包已返回签名结果；请通过 Testnet RPC/浏览器核对链上执行，不代表到账');
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <TonConnectButton />
      <label>
        Testnet 收款地址
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </label>
      <button disabled={busy || !wallet} onClick={() => void send()}>
        发送 0.01 测试 TON
      </button>
      <p role="status">{status}</p>
    </>
  );
}
// public/tonconnect-manifest.json 必须能被钱包公开访问，不能使用钱包无法访问的 localhost。
export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
      <Transfer />
    </TonConnectUIProvider>
  );
}
