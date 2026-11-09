# 独立接入配方

这些配方用于**新建的独立 React / Vite 工程**，不要把所有钱包 Provider 或 UI 框架一起装进主站。主站已运行的组件见 `src/components`；这里的示例没有纳入主站编译和端到端测试。安装时固定同一兼容代际并提交 lockfile，尤其留意钱包 SDK 的 React、wagmi、Viem peerDependencies。官方 API 随版本变化，升级后重新跑连接/拒签/切链流程。

| 文件 | 适用场景 | 配置 |
|---|---|---|
| [RainbowKit.tsx](RainbowKit.tsx) | PC 扩展 + 手机扫码 + 移动深链、合约读写 | WalletConnect projectId、Sepolia Counter 地址 |
| [Reown.tsx](Reown.tsx) | EVM 钱包聚合、二维码与移动钱包 | Reown projectId、站点 origin |
| [Solana.tsx](Solana.tsx) | Solana Devnet 连接、余额读取 | Devnet RPC；公共 RPC 有限流 |
| [Ton.tsx](Ton.tsx) | TON 连接、账户展示、交易确认 | 可公开访问的 manifest、Testnet 收款地址 |
| [Mobile.tsx](Mobile.tsx) | Ant Design Mobile + Swiper 活动报名 | 样式导入、浏览器环境 |
| [Creative.tsx](Creative.tsx) | Three Fiber / Drei 3D + GSAP 动效 | WebGL、减少动态效果偏好 |
| [TokenPanel.tsx](TokenPanel.tsx) | ERC20 余额、精度和精确授权 | RainbowKit/Wagmi Provider、已部署 ERC20 |
| [DemoToken.sol](DemoToken.sol) | OpenZeppelin ERC20 本地教学合约 | Solidity 0.8.24+、OpenZeppelin 5.x |

普通手机浏览器一般没有 `window.ethereum`，要用 WalletConnect 的 QR / universal link / deep link；钱包内置浏览器可用注入 Provider。钱包 App 回跳、iOS Safari、Android Chrome、被用户拒绝、网络不匹配，都需要在真实设备上验证，桌面仿真不能替代。不要把地址二维码当成 WalletConnect 会话二维码。

`VITE_*` 全部是公开的客户端配置；不能放服务端 API secret、私钥或真实助记词。钱包连接不等于登录鉴权。登录使用带 domain、nonce、有效期的 SIWE，服务端校验签名并消费 nonce。生产合约写入还应处理 receipt revert、替换/取消、超时后按原 hash 查询、重组及业务幂等。
