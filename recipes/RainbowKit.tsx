// 独立工程依赖：@rainbow-me/rainbowkit@2 wagmi@2 viem@2 @tanstack/react-query@5
// 环境：VITE_WALLETCONNECT_PROJECT_ID、VITE_SEPOLIA_COUNTER
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton, RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  WagmiProvider,
  useAccount,
  useReadContract,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAddress, parseAbi } from 'viem';
import { useEffect } from 'react';
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) throw new Error('请配置 WalletConnect projectId，并在控制台设置允许的域名');
const config = getDefaultConfig({
  appName: 'Activity Lab',
  projectId,
  chains: [sepolia],
  ssr: false,
});
const queryClient = new QueryClient();
const abi = parseAbi(['function count() view returns (uint256)', 'function increment()']);
function Counter() {
  const { address: account, chainId, isConnected } = useAccount();
  const raw = import.meta.env.VITE_SEPOLIA_COUNTER || '';
  const address = isAddress(raw) ? raw : undefined;
  const { switchChain, error: switchError } = useSwitchChain();
  const read = useReadContract({
    address,
    abi,
    functionName: 'count',
    chainId: sepolia.id,
    query: { enabled: !!address },
  });
  const simulation = useSimulateContract({
    address,
    abi,
    functionName: 'increment',
    account,
    chainId: sepolia.id,
    query: { enabled: !!address && isConnected && chainId === sepolia.id },
  });
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data, chainId: sepolia.id });
  useEffect(() => {
    if (receipt.isSuccess) void read.refetch();
  }, [receipt.isSuccess]);
  const error = switchError || read.error || simulation.error || write.error || receipt.error;
  return (
    <>
      <ConnectButton />
      <p>计数：{read.data?.toString() ?? '未读取'}</p>
      {!address && <p>请配置 Sepolia 合约地址</p>}
      {isConnected && chainId !== sepolia.id && (
        <button onClick={() => switchChain({ chainId: sepolia.id })}>切换 Sepolia</button>
      )}
      <button
        disabled={
          !simulation.data || chainId !== sepolia.id || write.isPending || receipt.isLoading
        }
        onClick={() => simulation.data && write.writeContract(simulation.data.request)}
      >
        模拟通过后提交 +1
      </button>
      <p role="status">
        {write.isPending
          ? '请确认钱包'
          : receipt.isLoading
            ? '等待确认'
            : receipt.data?.status === 'reverted'
              ? '交易回滚'
              : receipt.isSuccess
                ? '链上已确认'
                : ''}
      </p>
      {error && <p role="alert">{error.message}</p>}
    </>
  );
}
export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Counter />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
