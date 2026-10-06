import { createServer } from 'node:http'
import { queryLocalShops } from './shops.mjs'

const port = 4311
export function isLocalRequest(request) {
  return ['127.0.0.1:4311', 'localhost:4311'].includes(request.headers.host) &&
    (!request.headers.origin || ['http://127.0.0.1:4310', 'http://localhost:4310'].includes(request.headers.origin))
}

export function createLocalServer(query = queryLocalShops) {
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (!isLocalRequest(request)) {
      response.writeHead(403).end(JSON.stringify({ ok: false, error: '仅本机开发页面可访问。' }))
      return
    }
    if (request.method !== 'GET' || request.url !== '/api/shops') {
      response.writeHead(404).end(JSON.stringify({ ok: false, error: '仅提供店铺只读查询。' }))
      return
    }
    try {
      response.writeHead(200).end(JSON.stringify({ ok: true, data: await query() }))
    } catch {
      // 不回传 CLI stdout/stderr（可能包含用户业务数据或凭据）。
      response.writeHead(503).end(JSON.stringify({ ok: false, error: '本机 CLI 不可用或未授权。' }))
    }
  })
}

if (process.argv[1]?.endsWith('/local-api/server.mjs')) {
  createLocalServer().listen(port, '127.0.0.1', () => {
    console.log('本机 kuaimai-cli 只读桥接已监听 127.0.0.1:4311')
  })
}
