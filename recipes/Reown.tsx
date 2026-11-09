// 独立工程依赖：@reown/appkit @reown/appkit-adapter-wagmi wagmi@2 viem@2 @tanstack/react-query@5
import { createAppKit, useAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
if (!projectId) throw new Error('缺少 Reown projectId');
const networks: [typeof sepolia] = [sepolia];
const adapter = new WagmiAdapter({ projectId, networks });
createAppKit({
  adapters: [adapter],
  networks,
  projectId,
  metadata: {
    name: 'Activity Lab',
    description: 'Wallet connection tutorial',
    url: window.location.origin,
    icons: [],
  },
  features: { analytics: false },
});
const queryClient = new QueryClient();
function Wallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  return (
    <>
      <button onClick={() => void open()}>选择钱包 / 手机扫码</button>
      <p>{address || '未连接'}</p>
      {isConnected && <button onClick={() => disconnect()}>断开</button>}
    </>
  );
}
export default function App() {
  return (
    <WagmiProvider config={adapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Wallet />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
