import { execFile } from 'node:child_process'

// 与原纤莉秀 src/server/kuaimai/cli.ts 的 buildShopListArgs 保持同一只读命令。
export const shopArgs = [
  'web', 'call', 'shop.allShop', '--params',
  JSON.stringify({ baseItemId: '', queryName: '', source: '', subSource: '' }),
  '--output', 'json',
]

function runLocalCLI(args) {
  return new Promise((resolve, reject) => {
    execFile('kuaimai-cli', args, {
      shell: false,
      timeout: 15_000,
      maxBuffer: 1 << 20,
      env: { ...process.env, KUAIMAI_CLI_SKIP_SKILL_SYNC: '1', KUAIMAI_CLI_SKIP_UPDATE_CHECK: '1' },
    }, (error, stdout) => error ? reject(error) : resolve(stdout))
  })
}

export async function queryLocalShops(run = runLocalCLI) {
  const stdout = await run(shopArgs)
  const envelope = JSON.parse(stdout)
  if (envelope?.ok !== true) throw new Error('本机 kuaimai-cli 未完成授权或查询失败。')
  // 快麦的业务响应可能嵌在一层 data/result 下；只返回页面需要的店铺字段。
  const payload = envelope.data
  const rows = payload?.data?.list ?? payload?.list ?? payload?.result?.list ?? payload?.result?.data?.list
  if (!Array.isArray(rows)) throw new Error('店铺响应格式不符合预期。')
  const shops = rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const id = String(row.userId ?? row.id ?? '').trim().slice(0, 128)
    const name = String(row.priorityTitle ?? row.shortTitle ?? row.title ?? row.name ?? row.nick ?? '').trim().slice(0, 128)
    const platform = String(row.sourceName ?? row.subSourceName ?? row.source ?? '其他').trim().slice(0, 128)
    return id && name ? [{ id, name, platform }] : []
  })
  return [...new Map(shops.map((shop) => [shop.id, shop])).values()].slice(0, 1000)
}
