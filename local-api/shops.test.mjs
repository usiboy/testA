import assert from 'node:assert/strict'
import { once } from 'node:events'
import { request as httpRequest } from 'node:http'
import { test } from 'node:test'
import { createLocalServer } from './server.mjs'
import { queryLocalShops, shopArgs } from './shops.mjs'

test('只调用纤莉秀相同的只读 shop.allShop，按原项目字段去重规范化', async () => {
  const shops = await queryLocalShops((args) => {
    assert.deepEqual(args, shopArgs)
    assert.deepEqual(args.slice(0, 3), ['web', 'call', 'shop.allShop'])
    return JSON.stringify({ ok: true, data: { data: { list: [
      { userId: 'demo-1', priorityTitle: '示例店铺', sourceName: '唯品会' },
      { userId: 'demo-1', title: '重复店铺' },
      { userId: 'demo-2', shortTitle: '第二店铺', source: '抖音' },
    ] } } })
  })
  assert.deepEqual(shops, [
    { id: 'demo-1', name: '重复店铺', platform: '其他' },
    { id: 'demo-2', name: '第二店铺', platform: '抖音' },
  ])
  await assert.rejects(() => queryLocalShops(() => JSON.stringify({ ok: false, data: { list: [] } })))
})

test('HTTP 桥接只接受本机 Host/Origin 和固定 GET 路径', async (t) => {
  let calls = 0
  const server = createLocalServer(async () => { calls++; return [{ id: 'demo', name: '店铺', platform: '唯品会' }] })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => server.close())
  // fetch/undici 会把手工 Host 覆盖成真实端口；此处使用 http.request 测试 Host 边界。
  const request = (host, origin, method = 'GET') => new Promise((resolve, reject) => {
    const req = httpRequest({
      hostname: '127.0.0.1', port: server.address().port, path: '/api/shops', method,
      headers: { Host: host, Origin: origin },
    }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(body) }))
    })
    req.on('error', reject)
    req.end()
  })
  assert.equal((await request('evil.example', 'http://127.0.0.1:4310')).status, 403)
  assert.equal((await request('127.0.0.1:4311', 'http://evil.example')).status, 403)
  assert.equal((await request('127.0.0.1:4311', 'http://127.0.0.1:4310', 'POST')).status, 404)
  assert.equal(calls, 0)
  const result = await request('127.0.0.1:4311', 'http://127.0.0.1:4310')
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.data, [{ id: 'demo', name: '店铺', platform: '唯品会' }])
  assert.equal(calls, 1)
})
