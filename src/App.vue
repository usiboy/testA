<script setup>
import { computed, ref } from 'vue'

const input = ref('21')
const result = computed(() => {
  const value = Number(input.value)
  return /^\d+$/.test(input.value) && Number.isSafeInteger(value) && value <= 10000 ? value * 2 : null
})
</script>

<template>
  <main class="shell">
    <p class="eyebrow">LINGTONG / TENANT A / VUE</p>
    <h1>一次提交，<br><span>一个清晰的预览。</span></h1>
    <p class="intro">这是一份不连接外部系统的测试工程。输入一个整数，即可观察租户 A 的本地计算结果。</p>
    <section class="card" aria-label="租户 A 计算示例">
      <label for="value-a">测试整数（0—10000）</label>
      <input id="value-a" v-model.trim="input" inputmode="numeric" autocomplete="off" />
      <p v-if="result !== null" role="status">A 的结果 <strong>{{ result }}</strong></p>
      <p v-else role="alert">请输入有效的范围内整数。</p>
    </section>
    <footer>只含合成输入 · 不代表真实租户服务已部署</footer>
  </main>
</template>
