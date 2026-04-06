<template>
  <div
    ref="wrap"
    class="flex-1 h-full min-w-0 relative overflow-hidden"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <canvas ref="cnv" class="block w-full h-full" />

    <input
      v-if="inlineEditor.visible"
      ref="inlineInput"
      type="text"
      inputmode="numeric"
      :value="inlineEditor.raw"
      :style="inlineEditor.style"
      class="absolute border-2 border-blue-500 rounded text-center bg-white outline-none z-50"
      @input="inlineEditor.raw = ($event.target as HTMLInputElement).value"
      @keydown.enter.prevent="commitInline"
      @keydown.escape.prevent="cancelInline"
      @blur="commitInline"
    />

    <div class="absolute inset-0 pointer-events-none">
      <GraphTimeSeries
        v-for="g in graphs"
        :key="g.id"
        :yMax="g.customProps?.yMax ?? 100"
        :yStep="g.customProps?.yStep ?? 20"
        :timeStep="g.customProps?.timeStep ?? 1"
        :timePoints="g.customProps?.timePoints ?? 20"
        :value="getGraphValue(g)"
        :isRuntime="true"
        :style="getGraphStyle(g)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { fabric } from 'fabric'
import { setCanvas } from '@/composables/useCanvas'
import { useHmiRuntime, type HmiFile } from '@/runtime/useHmiRuntime'
import { useViewerCanvasStore } from '@/store/canvas'
import GraphTimeSeries from './GraphTimeSeries.vue'

const DEFAULT_MIN_ZOOM = 0.25
const DEFAULT_MAX_ZOOM = 4
const VIEWPORT_PADDING = 40

const props = defineProps<{ hmi: HmiFile | null }>()

const wrap = shallowRef<HTMLElement>()
const cnv = shallowRef<HTMLCanvasElement>()
const inlineInput = ref<HTMLInputElement>()
const graphs = ref<any[]>([])

const store = useViewerCanvasStore()

let canvas!: fabric.Canvas
let resizeObserver: ResizeObserver | null = null
let runtime: ReturnType<typeof useHmiRuntime> | null = null

let isPanning = false
let isDragging = false
let lastPos = { x: 0, y: 0 }

const inlineEditor = ref({
  visible: false,
  raw: '',
  style: {} as Record<string, string>,
  target: null as any,
})

function clampZoom(z: number) {
  return Math.min(DEFAULT_MAX_ZOOM, Math.max(DEFAULT_MIN_ZOOM, z))
}

function syncViewToStore() {
  const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
  store.setViewportTransform({
    zoom: canvas.getZoom(),
    offsetX: vpt[4] ?? 0,
    offsetY: vpt[5] ?? 0,
  })
}

function applyTransform(t: { zoom: number; offsetX: number; offsetY: number }) {
  canvas.setViewportTransform([t.zoom, 0, 0, t.zoom, t.offsetX, t.offsetY])
  canvas.requestRenderAll()
  store.setViewportTransform(t)
  updateGridBackground()
  drawGuides()
}

function updateGridBackground() {
  if (!wrap.value || !store.grid.showGrid) {
    if (wrap.value) wrap.value.style.backgroundImage = ''
    return
  }

  const zoom = canvas.getZoom()
  const size = Math.max(store.grid.size * zoom, 1)
  const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
  const color = 'rgba(99,102,241,0.16)'

  wrap.value.style.backgroundImage =
    `linear-gradient(0deg, ${color} 1px, transparent 1px),
     linear-gradient(90deg, ${color} 1px, transparent 1px)`

  wrap.value.style.backgroundSize = `${size}px ${size}px`

  const offsetX = ((vpt[4] ?? 0) % size + size) % size
  const offsetY = ((vpt[5] ?? 0) % size + size) % size

  wrap.value.style.backgroundPosition = `${offsetX}px ${offsetY}px`
}

function drawGuides() {
  const ctx = (canvas as any).contextTop
  if (!ctx) return

  canvas.clearContext(ctx)

  if (!store.grid.showGuides) return

  const width = canvas.getWidth()
  const height = canvas.getHeight()

  ctx.save()
  ctx.strokeStyle = 'rgba(99,102,241,0.4)'
  ctx.lineWidth = 1

  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()

  ctx.restore()
}

function getGraphStyle(obj: any) {
  return {
    position: 'absolute',
    left: obj.left + 'px',
    top: obj.top + 'px',
    width: obj.width * (obj.scaleX ?? 1) + 'px',
    height: obj.height * (obj.scaleY ?? 1) + 'px',
  }
}

function getGraphValue(g: any) {
  return typeof g.getCurrentValue === 'function' ? g.getCurrentValue() : 0
}

function updateGraphs() {
  graphs.value = canvas
    .getObjects()
    .filter((o: any) => o.elementType === 'time-graph')
}

function calcInlineStyle(element: any): Record<string, string> {
  const zoom = canvas.getZoom()
  const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
  const center = element.getCenterPoint()

  const w = (element.width ?? 120) * (element.scaleX ?? 1) * zoom
  const h = (element.height ?? 40) * (element.scaleY ?? 1) * zoom

  const screenX = center.x * zoom + vpt[4]
  const screenY = center.y * zoom + vpt[5]

  const canvasRect = cnv.value!.getBoundingClientRect()
  const wrapRect = wrap.value!.getBoundingClientRect()

  const offsetX = canvasRect.left - wrapRect.left
  const offsetY = canvasRect.top - wrapRect.top

  return {
    left: `${offsetX + screenX - w / 2}px`,
    top: `${offsetY + screenY - h / 2}px`,
    width: `${w}px`,
    height: `${h}px`,
  }
}

function refreshInlinePosition() {
  if (!inlineEditor.value.visible) return
  inlineEditor.value.style = calcInlineStyle(inlineEditor.value.target)
}

function openInlineEditor(el: any) {
  inlineEditor.value = {
    visible: true,
    raw: String(el.customProps.value),
    style: calcInlineStyle(el),
    target: el,
  }

  setTimeout(() => {
    inlineInput.value?.focus()
    inlineInput.value?.select()
  })
}

function commitInline() {
  if (!inlineEditor.value.visible) return
  inlineEditor.value.target?.commitValue?.(inlineEditor.value.raw)
  inlineEditor.value.visible = false
}

function cancelInline() {
  inlineEditor.value.visible = false
}

function onSpaceDown(e: KeyboardEvent) {
  if (e.code !== 'Space' || isPanning) return
  isPanning = true
  canvas.defaultCursor = 'grab'
}

function onSpaceUp(e: KeyboardEvent) {
  if (e.code !== 'Space') return
  isPanning = false
  isDragging = false
  canvas.defaultCursor = 'default'
}

function onMouseDown(e: MouseEvent) {
  if (!isPanning) return
  isDragging = true
  canvas.defaultCursor = 'grabbing'
  lastPos = { x: e.clientX, y: e.clientY }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging) return

  const vpt = canvas.viewportTransform!
  const dx = e.clientX - lastPos.x
  const dy = e.clientY - lastPos.y
  const zoom = canvas.getZoom()

  vpt[4] += dx * zoom
  vpt[5] += dy * zoom

  lastPos = { x: e.clientX, y: e.clientY }

  canvas.requestRenderAll()
  syncViewToStore()
  updateGridBackground()
}

function onMouseUp() {
  isDragging = false
}

onMounted(() => {
  canvas = new fabric.Canvas(cnv.value!, { selection: false })

  setCanvas(canvas)

  runtime = useHmiRuntime(canvas)

  canvas.on('object:added', updateGraphs)
  canvas.on('object:removed', updateGraphs)
  canvas.on('after:render', refreshInlinePosition)
  canvas.on('element:edit-number', (e: any) => openInlineEditor(e.target))

  resizeObserver = new ResizeObserver(([entry]) => {
    canvas.setDimensions({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    })
    updateGridBackground()
    drawGuides()
  })

  wrap.value && resizeObserver.observe(wrap.value)

  window.addEventListener('keydown', onSpaceDown)
  window.addEventListener('keyup', onSpaceUp)

  if (props.hmi && runtime) {
    runtime.loadHmi(props.hmi)
  }
})

watch(
  () => props.hmi,
  (file) => {
    if (file && runtime) {
      cancelInline()
      runtime.loadHmi(file)
    }
  }
)

watch(() => store.grid.showGrid, updateGridBackground)
watch(() => store.grid.size, updateGridBackground)
watch(() => store.grid.showGuides, drawGuides)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onSpaceDown)
  window.removeEventListener('keyup', onSpaceUp)

  resizeObserver?.disconnect()
  canvas.dispose()
})
</script>
