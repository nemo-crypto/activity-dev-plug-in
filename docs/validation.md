# 本次验证记录

2026-11-09，本地 macOS arm64 / Node 24.14.1。

- `npm run build`：TypeScript 与生产构建通过；按 React、动效、浮层、数据与钱包分包，无超过默认 500 kB 阈值的单个 chunk。
- `npm test`：2 个测试通过。合约生命周期测试包含部署、初始读取、模拟不变更状态、真实广播确认、事件解析、拒绝 value、非法调用回滚。
- Playwright：7 个场景 × 桌面 / 手机视口，共 14 项通过。首次桌面部署遇到默认 gas 不足，修复为估算部署 gas 后，两个平台的真实 RPC 场景均复核通过。
- 生产产物冒烟：桌面与手机视口均无 JavaScript 运行异常、无页面横向溢出，弹窗可打开/关闭；截图见 README。
- `npm ci --dry-run --ignore-scripts --os=linux --cpu=x64`：通过。Ganache 内嵌 fsevents 在 lockfile 标为 optional，避免 Linux CI 误装 macOS 依赖。

Ganache 在 Node 24 / macOS 上原生 µWS 模块不可用时，会提示回退到 Node.js 实现；本次实际部署和读写测试均使用该回退实现通过。CI 配置使用 Node 22，远程执行结果以 GitHub Actions 为准。

未验证范围：真实钱包扩展签名 UI、手机钱包 App 深链/回跳、外部测试网、Zendesk 真实账号。`recipes` 中的独立生态配方未安装编译；需要按配置条件在独立项目里联调，不能把本记录视为其验证结果。
