import { test, expect } from '@playwright/test';

async function prepare(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const listeners = new Map<string, Set<(...args: any[]) => void>>();
    let resolveAccounts: (accounts: string[]) => void;
    const provider = {
      async request({ method }: { method: string }) {
        if (method === 'eth_requestAccounts') return new Promise<string[]>(resolve => { resolveAccounts = resolve; });
        if (method === 'eth_chainId') return '0x7a69';
        throw new Error(`Unexpected request: ${method}`);
      },
      on(event: string, callback: (...args: any[]) => void) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(callback);
      },
      removeListener(event: string, callback: (...args: any[]) => void) { listeners.get(event)?.delete(callback); },
    };
    window.addEventListener('eip6963:requestProvider', () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
      detail: { info: { uuid: 'delayed-wallet', name: '延迟测试钱包' }, provider },
    })));
    (window as any).walletTest = {
      ready: () => listeners.has('disconnect') && !!resolveAccounts,
      emit: (event: string, value?: unknown) => listeners.get(event)?.forEach(callback => callback(value)),
      resolve: () => resolveAccounts(['0x1111111111111111111111111111111111111111']),
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: '连接 延迟测试钱包' }).click();
  await page.waitForFunction(() => (window as any).walletTest.ready());
}

test('disconnect during wallet approval cannot be undone by a late account response', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => (window as any).walletTest.emit('disconnect'));
  await page.evaluate(() => (window as any).walletTest.resolve());
  await expect(page.getByRole('button', { name: '连接 延迟测试钱包' })).toBeEnabled();
  await expect(page.locator('.wallet-card')).toContainText('账户：未连接');
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeDisabled();
  await expect(page.locator('.wallet-card [role=status]')).toContainText('钱包已断开');
});

test('account events received during approval stay authoritative without losing the chain', async ({ page }) => {
  await prepare(page);
  const currentAccount = '0x2222222222222222222222222222222222222222';
  await page.evaluate(account => (window as any).walletTest.emit('accountsChanged', [account]), currentAccount);
  await page.evaluate(() => (window as any).walletTest.resolve());
  await expect(page.getByRole('button', { name: '连接 延迟测试钱包' })).toBeEnabled();
  await expect(page.locator('.wallet-card')).toContainText(`账户：${currentAccount}`);
  await expect(page.locator('.wallet-card')).toContainText('网络：31337');
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeEnabled();
});
test('an account removal event during approval cannot be replaced by the old response', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => (window as any).walletTest.emit('accountsChanged', []));
  await page.evaluate(() => (window as any).walletTest.resolve());
  await expect(page.getByRole('button', { name: '连接 延迟测试钱包' })).toBeEnabled();
  await expect(page.locator('.wallet-card')).toContainText('账户：未连接');
  await expect(page.getByRole('button', { name: '模拟并提交 +1' })).toBeDisabled();
});
