# 按业务组合组件库

| 目标 | 推荐组合 | 先看哪个示例 | 留意 |
|---|---|---|---|
| 企业 PC 后台 | Ant Design 或 Mantine + TanStack Query + Zod | 表单、表格、图表 | 不要并装多套完整 UI 框架；设计 token 统一 |
| 自定义品牌站 | shadcn/ui + Radix + Motion + Sonner | 弹窗、动画卡片、命令菜单 | 复制源码后要自己维护升级和无障碍 |
| 手机活动页 | Ant Design Mobile + Swiper + Day.js | Mobile.tsx、转盘 | safe area、键盘遮挡、触摸命中区、网络失败 |
| 营销视觉页 | GSAP / Motion + Rive 或 Three Fiber | Creative.tsx | 视频/3D 资源按需加载，提供低性能设备降级 |
| EVM DApp | RainbowKit + wagmi + Viem + Query | RainbowKit.tsx、钱包实验 | 移动深链、切链、账户变化、拒签、receipt |
| 多生态钱包入口 | Reown AppKit，或分别用链专用 SDK | Reown / Solana / Ton | 地址、金额精度和交易模型不能跨链复用 |
| NFT / 游戏界面 | Three Fiber + Drei + 钱包连接 + 索引 API | Creative.tsx + 钱包实验 | 展示余额不等于有业务资格，服务端复核 |
| 大数据列表 | TanStack Table + Virtual + Query | 表格实验 | 服务器分页/排序；虚拟列表保留键盘导航 |
| ERC20 授权 | wagmi + Viem + OpenZeppelin | TokenPanel.tsx | 精确额度，显示 spender；零额度撤销 |

## 在独立工程试配方

```bash
npm create vite@latest my-demo -- --template react-ts
cd my-demo
npm install
```

按需选一组依赖，将对应 `.tsx` 内容复制到 `src/App.tsx`（带导出组件的 TokenPanel 需在钱包 Provider 内使用）：

```bash
# EVM 钱包弹窗 + 合约 Hooks
npm install @rainbow-me/rainbowkit@2 wagmi@2 viem@2 @tanstack/react-query@5
# 或 Reown 聚合入口（不要与上一套重复包裹 Provider）
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi@2 viem@2 @tanstack/react-query@5
# Solana Devnet
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/web3.js@1
# TON Testnet
npm install @tonconnect/ui-react @ton/core
# 手机活动页
npm install antd-mobile@5 swiper@11
# 创意 3D（React 19 工程）
npm install three @react-three/fiber@9 @react-three/drei@10 gsap
npm install -D @types/three
# ERC20 Solidity 合约工程
npm install @openzeppelin/contracts@5
```

这些是接入指引，未在本仓库逐组执行安装或验证最新版兼容性。首次集成阅读依赖的 peerDependencies，固定版本、保留 lockfile；遇到不兼容先调整版本，不使用 `--force` 掩盖问题。

## 选型核对

关注官方维护状态、许可证、框架和 SSR 支持、无障碍质量、包体积、移动设备性能、主题能力。热门关键词可以帮助发现库，但最终要通过目标页面与真实设备测试决定。付费组件、服务端接口、钱包 projectId 配额分别核算，不把全部目录当成免费可商用承诺。
