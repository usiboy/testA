<script setup>
import { computed, ref } from 'vue'

// 从纤莉秀的三个实际工具提炼交互模型；这里的值全部为合成演示数据。
const tools = [
  { id: 'orders', index: '01', label: '订单库存缺口', short: '订单缺口', symbol: '▤' },
  { id: 'transfer', index: '02', label: '库存调拨建议', short: '调拨建议', symbol: '⇄' },
  { id: 'pallet', index: '03', label: '商品货盘报表', short: '商品货盘', symbol: '▦' },
]
const orders = [
  { id: 'DEMO-26001', platform: '唯品会 JIT', sku: 'DEMO-KN-2408', product: '针织开衫 · 雾白', warehouse: '广州公有仓 → 唯品虚拟仓', required: 36, allocated: 12, stock: 8, flag: '优先调拨' },
  { id: 'DEMO-26002', platform: '抖音', sku: 'DEMO-DR-1902', product: '亚麻连衣裙 · 琥珀', warehouse: '广州公有仓 → 抖音虚拟仓', required: 24, allocated: 10, stock: 6, flag: '关注库存' },
  { id: 'DEMO-26003', platform: '唯品会 JIT', sku: 'DEMO-CT-3611', product: '轻薄风衣 · 沙色', warehouse: '广州公有仓 → 唯品虚拟仓', required: 18, allocated: 4, stock: 3, flag: '优先调拨' },
  { id: 'DEMO-26004', platform: '淘宝', sku: 'DEMO-SH-0815', product: '立领衬衫 · 米杏', warehouse: '广州公有仓 → 淘宝虚拟仓', required: 16, allocated: 8, stock: 5, flag: '关注库存' },
  { id: 'DEMO-26005', platform: '拼多多', sku: 'DEMO-PT-2109', product: '直筒长裤 · 炭灰', warehouse: '广州公有仓 → 拼多多虚拟仓', required: 30, allocated: 20, stock: 7, flag: '待复核' },
]

const activeTool = ref('orders')
const keyword = ref('')
const platform = ref('全部平台')
const jitOnly = ref(false)
const mobileMenu = ref(false)
const localShops = ref([])
const localState = ref('idle')
const localMessage = ref('')

const selectedTool = computed(() => tools.find((tool) => tool.id === activeTool.value) ?? tools[0])
const filteredOrders = computed(() => orders.filter((order) =>
  (!keyword.value.trim() || `${order.sku} ${order.product} ${order.id}`.toLowerCase().includes(keyword.value.trim().toLowerCase())) &&
  (platform.value === '全部平台' || order.platform === platform.value) &&
  (!jitOnly.value || order.platform === '唯品会 JIT'),
))
const missing = computed(() => filteredOrders.value.reduce((sum, row) => sum + Math.max(row.required - row.allocated - row.stock, 0), 0))
const localOnly = import.meta.env.DEV && ['127.0.0.1', 'localhost'].includes(window.location.hostname)

function selectTool(id) {
  activeTool.value = id
  mobileMenu.value = false
}

async function loadLocalShops() {
  if (!localOnly) return
  localState.value = 'loading'
  localMessage.value = ''
  try {
    const response = await fetch('/api/shops', { credentials: 'same-origin' })
    const result = await response.json()
    if (!response.ok || result.ok !== true || !Array.isArray(result.data)) throw new Error('本机 CLI 查询不可用。')
    localShops.value = result.data
    localState.value = 'ready'
  } catch {
    localState.value = 'error'
    localMessage.value = '无法连接本机只读 CLI 服务；演示数据仍可使用。'
  }
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ 'sidebar-open': mobileMenu }" aria-label="工具导航">
      <div class="brand-row"><div class="brand-mark" aria-hidden="true">纤</div><div><strong>纤莉秀</strong><small>OPERATIONS STUDIO</small></div></div>
      <div class="sidebar-rule"></div>
      <p class="sidebar-label">WORKSPACE / 工作空间</p>
      <div class="workspace"><span class="workspace-icon">XL</span><div><strong>快麦应用模板</strong><small>单租户 · 静态演示</small></div><span class="workspace-chevron">⌄</span></div>
      <p class="sidebar-label tool-label">ANALYTICS / 业务工具</p>
      <nav class="tool-nav">
        <button v-for="tool in tools" :key="tool.id" type="button" :class="['nav-item', { active: activeTool === tool.id }]" :aria-current="activeTool === tool.id ? 'page' : undefined" @click="selectTool(tool.id)">
          <span class="nav-symbol" aria-hidden="true">{{ tool.symbol }}</span><span>{{ tool.short }}</span><span class="nav-index">{{ tool.index }}</span>
        </button>
      </nav>
      <div class="sidebar-bottom"><div class="sidebar-bottom-title"><span class="online-dot"></span> 演示环境</div><p>仅展示合成数据。公开站点不会连接快麦，也不会接收 accessToken。</p><div class="sidebar-version">TEMPLATE / 01 <span>↗</span></div></div>
    </aside>

    <div class="main-column">
      <header class="topbar"><div class="topbar-left"><button type="button" class="menu-button" aria-label="打开导航" @click="mobileMenu = !mobileMenu">☰</button><span class="breadcrumb">工作空间</span><span class="breadcrumb-separator">/</span><strong>{{ selectedTool.label }}</strong></div><div class="topbar-right"><span class="demo-pill"><span class="online-dot"></span> PUBLIC DEMO</span><span class="avatar">XL</span></div></header>
      <main class="content">
        <div class="page-heading"><div><p class="eyebrow">QIANLIXIU <span class="eyebrow-rule"></span> KUAIMAI APPLICATION TEMPLATE</p><h1>{{ selectedTool.label }}<span class="title-dot">.</span></h1><p class="lead">来自纤莉秀实际运营项目的工作流样板。以明确的数据口径，连接订单、库存与经营决策。</p></div><div class="heading-stamp">FIELD NOTES <strong>{{ selectedTool.index }} / 03</strong><span>DEMONSTRATION ONLY</span></div></div>

        <section class="notice" aria-label="数据状态"><div class="notice-icon">ⓘ</div><p><strong>当前展示合成样例</strong><span>线上 HTTP 页面没有登录入口、业务接口或真实快麦数据。实际 `kuaimai-cli` 调用只可在本机开发服务主动触发。</span></p><span class="notice-tag">NO CREDENTIALS</span></section>

        <template v-if="activeTool === 'orders'">
          <section class="metrics" aria-label="演示订单概览">
            <div class="metric"><span>当前订单</span><strong>{{ String(filteredOrders.length).padStart(2, '0') }}</strong><small>筛选后的合成记录</small></div>
            <div class="metric"><span>待补缺口</span><strong>{{ String(missing).padStart(2, '0') }}<em>件</em></strong><small>订购 − 已配 − 可用</small></div>
            <div class="metric"><span>优先调拨</span><strong>{{ String(filteredOrders.filter(row => row.flag === '优先调拨').length).padStart(2, '0') }}</strong><small>需要人工核对</small></div>
          </section>
          <section class="panel"><div class="panel-head"><div><p class="section-kicker">01 / ORDER INTELLIGENCE</p><h2>缺口明细</h2><p>按店铺平台与 SKU 快速定位待处理订单。</p></div><div class="panel-mark">ORDER / STOCK</div></div>
            <div class="filter-row"><label class="field search-field"><span>搜索订单或 SKU</span><input v-model="keyword" type="search" placeholder="输入演示单号 / SKU / 商品名" /></label><label class="field platform-field"><span>平台</span><select v-model="platform"><option>全部平台</option><option>唯品会 JIT</option><option>抖音</option><option>淘宝</option><option>拼多多</option></select></label><label class="jit-filter"><input v-model="jitOnly" type="checkbox" /><span>仅唯品会 JIT</span></label></div>
            <div class="table-scroll"><table><thead><tr><th>订单编号 / 平台</th><th>商品与 SKU</th><th>仓库流向</th><th class="numeric">订购</th><th class="numeric">已配</th><th class="numeric">缺口</th><th>建议状态</th></tr></thead><tbody><tr v-for="row in filteredOrders" :key="row.id"><td><strong class="mono">{{ row.id }}</strong><small>{{ row.platform }}</small></td><td><strong>{{ row.product }}</strong><small class="mono">{{ row.sku }}</small></td><td class="warehouse">{{ row.warehouse }}</td><td class="numeric">{{ row.required }}</td><td class="numeric">{{ row.allocated }}</td><td class="numeric deficit">{{ Math.max(row.required - row.allocated - row.stock, 0) }}</td><td><span :class="['status', row.flag === '优先调拨' ? 'status-urgent' : '']">{{ row.flag }}</span></td></tr><tr v-if="!filteredOrders.length"><td colspan="7" class="empty">没有匹配的演示订单。请调整筛选条件。</td></tr></tbody></table></div>
            <div class="panel-foot"><span>展示 {{ filteredOrders.length }} / {{ orders.length }} 条样例</span><span>样例编号以 DEMO- 开头 · 不涉及真实订单</span></div>
          </section>
        </template>

        <template v-else-if="activeTool === 'transfer'"><section class="feature-panel"><p class="section-kicker">02 / INVENTORY TRANSFER</p><h2>把库存缺口转化为可执行的调拨建议。</h2><p>实际纤莉秀使用公有仓可配数作为供给上限，同一 SKU 的公有库存只分配一次。下面的数字均为演示样例，不会向快麦发起调拨。</p><div class="flow"><div><small>01 / 发现</small><strong>订单缺口</strong><span>识别虚拟仓短缺 SKU</span></div><span class="flow-arrow">→</span><div><small>02 / 核对</small><strong>公有仓可配</strong><span>检查真实可调拨上限</span></div><span class="flow-arrow">→</span><div><small>03 / 建议</small><strong>人工复核</strong><span>输出建议，不自动写库存</span></div></div><button class="secondary-action" type="button" @click="selectTool('orders')">查看演示订单 <span>↗</span></button></section></template>

        <template v-else><section class="feature-panel"><p class="section-kicker">03 / PRODUCT PALLET</p><h2>让商品与销售数据，回到同一张决策桌面。</h2><p>实际纤莉秀将商品档案与 T+1 销售报表关联，生成 SKU 货盘与多维透视。模板不附带真实 SQLite 种子、销售报表或商品档案。</p><div class="pallet-preview"><div><span>商品档案</span><strong>SKU 基础信息</strong><small>款号 / 波段 / 规格</small></div><div><span>销售主题</span><strong>T+1 销售趋势</strong><small>净销量 / 退款率</small></div><div><span>决策视图</span><strong>货盘与透视</strong><small>渠道 / 时间 / 分类</small></div></div></section></template>

        <section v-if="localOnly" class="local-panel"><div><p class="section-kicker">LOCAL DEVELOPMENT / READ-ONLY CLI</p><h2>连接本机快麦环境</h2><p>仅在 <code>localhost</code> 开发页面显示；先在本机完成 `kuaimai-cli` 系统授权，再启动 <code>npm run local:api</code>。仅查询店铺名称，不提交凭据，也不写业务数据。</p><button type="button" class="local-action" :disabled="localState === 'loading'" @click="loadLocalShops">{{ localState === 'loading' ? '正在读取…' : '读取本机店铺' }} <span>↗</span></button><p v-if="localMessage" role="alert" class="local-message">{{ localMessage }}</p><p v-if="localState === 'ready'" role="status" class="local-message">已从本机 CLI 读取 {{ localShops.length }} 家店铺（不替换上方的演示订单）。</p></div><div class="local-visual" aria-hidden="true">CLI<br><span>↗ LOCAL ONLY</span></div></section>

        <footer class="page-footer"><span>纤莉秀 × kuaimai-cli / APPLICATION TEMPLATE</span><span>基于实际项目业务口径改造 · 本页仅供静态交付验证</span></footer>
      </main>
    </div>
  </div>
</template>
