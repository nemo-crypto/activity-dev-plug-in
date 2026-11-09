declare global { interface Window { zE?: (...args: unknown[]) => void } }
let pending: Promise<void> | undefined;
export function openSupport(key: string) {
  if (!/^[a-zA-Z0-9-]{8,100}$/.test(key)) return Promise.reject(new Error('请先配置有效的 Zendesk widget key'));
  if (window.zE) { window.zE('messenger', 'open'); return Promise.resolve(); }
  if (!pending) pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${encodeURIComponent(key)}`;
    const timer = setTimeout(() => fail(), 15000);
    function fail() { clearTimeout(timer); script.remove(); pending = undefined; reject(new Error('客服加载失败，请稍后重试')); }
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (!window.zE) { fail(); return; }
      window.zE('messenger:set', 'locale', 'zh-cn'); resolve();
    };
    document.head.appendChild(script);
  });
  return pending.then(() => window.zE?.('messenger', 'open'));
}
