<template>
  <div ref="chartEl" class="graph-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  yMax: number
  yStep: number
  timeStep: number
  timePoints: number
  value: number
  isRuntime: boolean
}>()

const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let timer: number | null = null

let data: number[] = []

function initData() {
  data = Array(props.timePoints).fill(0)
}

function buildXLabels(): string[] {
  return Array.from({ length: props.timePoints }, (_, i) => String(i - (props.timePoints - 1)))
}

function buildOption() {
  return {
    backgroundColor: '#0f172a',
    animation: false,
    grid: { left: 55, right: 20, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: buildXLabels(),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#94a3b8' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: props.yMax,
      interval: props.yStep,
      axisLine: { lineStyle: { color: '#94a3b8' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: '#1e293b' } },
    },
    series: [{
      name: 'value',
      type: 'line',
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 5,
      smooth: false,
      lineStyle: { width: 2, color: '#22c55e' },
      itemStyle: { color: '#22c55e' },
      data: [...data],
    }],
  }
}

function addPoint() {
  data.shift()
  data.push(props.value)
  chart?.setOption({ series: [{ data: [...data] }] })
}

function startTimer() {
  if (timer) return
  timer = window.setInterval(addPoint, props.timeStep * 1000)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function reset() {
  initData()
  chart?.setOption(buildOption())
}

watch(() => props.isRuntime, (val) => {
  if (val) { reset(); startTimer() }
  else { stopTimer(); reset() }
})

watch(() => [props.yMax, props.yStep], () => {
  chart?.setOption({ yAxis: { max: props.yMax, interval: props.yStep } })
})

watch(() => props.timePoints, () => {
  reset()
  chart?.setOption({ xAxis: { data: buildXLabels() } })
  if (props.isRuntime) { stopTimer(); startTimer() }
})

watch(() => props.timeStep, () => {
  if (props.isRuntime) { stopTimer(); startTimer() }
})

onMounted(() => {
  if (!chartEl.value) return
  initData()
  chart = echarts.init(chartEl.value)
  chart.setOption(buildOption())
  if (props.isRuntime) startTimer()
  window.addEventListener('resize', resize)
})

function resize() { chart?.resize() }

onBeforeUnmount(() => {
  stopTimer()
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<style scoped>
.graph-container { width: 100%; height: 100%; }
</style>
