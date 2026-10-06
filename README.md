# 纤莉秀 × kuaimai-cli：单租户应用模板

此仓库从真实[纤莉秀运营工具台](https://gitee.com/usiboy/qianlixiu)提炼三类业务流程（订单库存缺口、库存调拨建议、商品货盘），保留暖灰底色、深色导航与赭红强调色，供租户开发平台验证 **Git 固定提交 → Vite 构建 → HTTP 静态交付**。页面所有订单、商品、数字均为 `DEMO-` 合成样例，公开 HTTP 版没有登录框、业务 API、SQLite 或快麦凭据。原项目的数据种子、内部部署配置和完整服务端代码均未复制。

## 本机验证

要求 Node.js 22+。在仓库目录执行：

```bash
npm ci --ignore-scripts
npm test
npm run build
npm run dev
```

页面位于 `http://127.0.0.1:4310`；构建目录为 `dist/`。`dist/` 是公开无凭据静态站点，可以通过 HTTP 提供服务。`npm run build` 不调用快麦、不运行后端，也不会把本机配置打进静态产物。

## 仅本机的 kuaimai-cli 只读桥接

参考原项目 `src/server/kuaimai/cli.ts` 的 `shop.allShop` 调用及店铺字段规范化。由使用者**在本机**先完成 `kuaimai-cli auth login system`，然后另开终端执行 `npm run local:api`；Vite 开发模式会把 `/api/shops` 代理到仅监听 `127.0.0.1:4311` 的只读桥接。页面上点击“读取本机店铺”才能触发查询；不提供令牌输入框，不修改库存，不把真实店铺数据复制到演示订单中。公开构建既不携带桥接器，也不调用它。桥接服务仅接受本机开发 Host/Origin，响应只保留店铺 ID、名称和平台，不记录 CLI stdout/stderr。

**平台验收口径：**当前静态模板可用于验证测试租户的源码、构建和无凭据 HTTP 站点；原纤莉秀的 Express、SQLite、快麦会话及真实订单/库存任务仍需独立的动态运行时、持久卷、CI/CD 任务与资源配额，不能用本模板的站点状态代替完整应用上线。更多差异参见新平台的单租户适配验收记录。

GitHub Actions 会在 main 推送/PR 时执行 `npm ci`、桥接器测试与 Vite 构建，并保存 7 天的无凭据静态构建产物。平台自动部署、动态应用运行与配额管理仍需在平台侧单独验收；CI 成功不能直接表示生产站点已更新。
