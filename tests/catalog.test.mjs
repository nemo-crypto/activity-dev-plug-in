import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../src/catalog.json', import.meta.url), 'utf8'));
test('选型目录具有唯一名称、HTTPS 官方入口和明确覆盖状态', () => {
  assert.equal(new Set(catalog.map(x => x.name)).size, catalog.length);
  assert.equal(new Set(catalog.map(x => x.category)).size, 7);
  for (const item of catalog) {
    assert.equal(new URL(item.url).protocol, 'https:');
    assert.ok(item.package && item.use);
    assert.ok(['可运行', '接入示例', '选型目录'].includes(item.status));
  }
});
