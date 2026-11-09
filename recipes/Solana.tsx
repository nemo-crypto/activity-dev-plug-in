// 独立工程依赖：@solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/web3.js@1
import { useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
function Balance() {
  const { connection } = useConnection(); const { publicKey } = useWallet();
  const [balance, setBalance] = useState<string>('—'), [error, setError] = useState('');
  useEffect(() => { let alive = true; setBalance('—'); setError(''); if (publicKey) connection.getBalance(publicKey).then(v => { if (alive) setBalance(String(v / LAMPORTS_PER_SOL)); }).catch(e => { if (alive) setError(e.message); }); return () => { alive = false; }; }, [connection, publicKey]);
  return <><WalletMultiButton/><p>Devnet SOL: {balance}</p><p role="alert">{error}</p></>;
}
// 现代 Wallet Standard 钱包可自动发现；旧钱包再按需增加对应 adapter。
export default function App() { return <ConnectionProvider endpoint={clusterApiUrl('devnet')}><WalletProvider wallets={[]} autoConnect={false}><WalletModalProvider><Balance/></WalletModalProvider></WalletProvider></ConnectionProvider>; }
