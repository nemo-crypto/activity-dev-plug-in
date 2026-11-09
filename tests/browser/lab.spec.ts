import { test, expect } from '@playwright/test';
test('目录筛选、空状态与响应式布局', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /好用的组件/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByLabel('搜索组件库').fill('RainbowKit');
  await expect(page.locator('.library')).toHaveCount(1);
  await expect(page.locator('.library')).toContainText('接入示例');
  await page.getByLabel('搜索组件库').fill('不存在的库xyz');
  await expect(page.getByRole('status').filter({ hasText: '没有匹配的组件库' })).toBeVisible();
  await page.getByLabel('搜索组件库').fill('');
  await page.getByLabel('示例覆盖').selectOption('可运行');
  await expect(page.locator('.library')).toHaveCount(16);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test('桌面弹窗与移动抽屉可以打开和关闭', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '打开活动规则' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '知道了' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('tab', { name: '移动抽屉' }).click();
  await page.getByRole('button', { name: '打开底部抽屉' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '选择免费体验' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('表单校验、表格筛选与客服本地预览', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '校验报名信息' }).click();
  await expect(page.getByText('请输入有效邮箱', { exact: true })).toBeVisible();
  await page.getByLabel('昵称', { exact: true }).fill('测试用户');
  await page.getByLabel('邮箱', { exact: true }).fill('demo@example.com');
  await page.getByLabel('同意演示条款').check();
  await page.getByRole('button', { name: '校验报名信息' }).click();
  await expect(page.getByText('测试用户，表单校验通过（未发送数据）')).toBeVisible();
  await page.getByLabel('筛选活动').fill('开源');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('开源贡献');
  await page.getByRole('button', { name: '打开快捷命令' }).click();
  await page.getByRole('combobox', { name: '组件快捷命令' }).fill('成功');
  await page.getByRole('combobox', { name: '组件快捷命令' }).press('Enter');
  await expect(page.getByText('操作已完成', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '打开客服' }).click();
  await expect(page.getByRole('status').filter({ hasText: '本地预览：你好' })).toBeVisible();
});
test('钱包不存在时可解释状态，错误地址不会发送 RPC', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('未发现钱包。', { exact: false })).toBeVisible();
  await page.getByLabel('Counter 合约地址').fill('invalid');
  await page.getByRole('button', { name: '读取 count' }).click();
  await expect(page.getByRole('status').filter({ hasText: '请输入有效合约地址' })).toBeVisible();
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeDisabled();
});
test('EIP-6963 钱包账户变化、切链和断开', async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = new Map<string, Set<(...args: any[]) => void>>();
    let chain = '0x1';
    const provider = {
      async request({ method }: { method: string }) {
        if (method === 'eth_requestAccounts') return ['0x1111111111111111111111111111111111111111'];
        if (method === 'eth_chainId') return chain;
        if (method === 'wallet_switchEthereumChain') {
          chain = '0x7a69';
          listeners.get('chainChanged')?.forEach((fn) => fn(chain));
          return null;
        }
        throw new Error('unexpected RPC: ' + method);
      },
      on(event: string, cb: (...args: any[]) => void) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(cb);
      },
      removeListener(event: string, cb: (...args: any[]) => void) {
        listeners.get(event)?.delete(cb);
      },
    };
    window.addEventListener('eip6963:requestProvider', () =>
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: { info: { uuid: 'test-provider', name: '教学测试钱包' }, provider },
        }),
      ),
    );
    (window as any).changeTestAccount = () =>
      listeners.get('accountsChanged')?.forEach((fn) => fn([]));
  });
  await page.goto('/');
  await page.getByRole('button', { name: '连接 教学测试钱包' }).click();
  await expect(page.getByText(/账户：0x1111/)).toBeVisible();
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeDisabled();
  await page.getByRole('button', { name: '切换本地链' }).click();
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeEnabled();
  await page.evaluate(() => (window as any).changeTestAccount());
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeDisabled();
  await page.getByRole('button', { name: '断开本站连接' }).click();
  await expect(page.getByRole('status').filter({ hasText: '已清除本站连接状态' })).toBeVisible();
});
test('转盘完成、动效切换与二维码空状态', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: '转一次' }).click();
  await expect(page.getByText(/本地演示：/)).toBeVisible();
  await page.getByRole('button', { name: '发布', exact: true }).click();
  await expect(page.getByRole('heading', { name: '发布你的下一次体验' })).toBeVisible();
  await page.getByLabel('二维码内容').fill('');
  await expect(page.getByText('输入内容生成二维码')).toBeVisible();
});

test('真实 RPC 合约读取、模拟、提交与回执刷新', async ({ page }) => {
  test.setTimeout(60000);
  // 浏览器中的测试 Provider 只转发到本次临时 Ganache；不接触真实钱包。
  const { startChain } = await import('../../scripts/local-chain.mjs');
  const chain = await startChain();
  try {
    await page.route('http://127.0.0.1:8545/**', async (route) => {
      const response = await fetch(chain.rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: route.request().postData(),
      });
      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: await response.text(),
      });
    });
    await page.addInitScript(() => {
      const provider = {
        async request({ method, params }: { method: string; params?: unknown[] }) {
          const response = await fetch('http://127.0.0.1:8545/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: method === 'eth_requestAccounts' ? 'eth_accounts' : method,
              params: params || [],
            }),
          });
          const body = await response.json();
          if (body.error) throw new Error(body.error.message);
          return body.result;
        },
      };
      window.addEventListener('eip6963:requestProvider', () =>
        window.dispatchEvent(
          new CustomEvent('eip6963:announceProvider', {
            detail: { info: { uuid: 'local-rpc', name: '本地 RPC 测试钱包' }, provider },
          }),
        ),
      );
    });
    await page.goto('/');
    await page.getByLabel('Counter 合约地址').fill(chain.address);
    await page.getByRole('button', { name: '读取 count' }).click();
    await expect(page.locator('.wallet-card .metric')).toContainText('0');
    await page.getByRole('button', { name: '连接 本地 RPC 测试钱包' }).click();
    await page.getByRole('button', { name: '模拟并提交 +1' }).click();
    await expect(page.getByRole('status').filter({ hasText: '交易成功，区块' })).toBeVisible();
    await expect(page.locator('.wallet-card .metric')).toContainText('1');
  } finally {
    await chain.server.close();
  }
});
