<template>
  <div
    v-if="visible"
    :style="containerStyle"
    class="absolute z-50 overflow-hidden rounded"
    style="background: white; border: 2px solid #3b82f6; box-sizing: border-box;"
    @mousedown.stop
    @mouseup.stop
    @click.stop
  >
    <!-- number display with highlighted segment -->
    <div
      class="w-full h-full flex items-center justify-center"
      :style="{ fontSize: fontSizePx, fontFamily, fontWeight }"
    >
      <!-- integer part -->
      <span
        :style="activeDigit === 0 ? highlightSpan : ''"
      >{{ intPart }}</span>

      <!-- decimal part -->
      <template v-if="decimals > 0">
        <span>.</span>
        <span
          v-for="(ch, i) in decChars"
          :key="i"
          :style="activeDigit === i + 1 ? highlightSpan : ''"
        >{{ ch }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { fabric } from 'fabric'

const props = defineProps<{
  canvasEl: HTMLCanvasElement | null
  wrapperEl: HTMLElement | null
  fabricCanvas: fabric.Canvas | null
}>()

const highlightSpan = 'background: rgba(59,130,246,0.3); border-radius: 2px; color: #1d4ed8;'

const visible    = ref(false)
const target     = ref<any>(null)
const containerStyle = ref<Record<string, string>>({})

// derived display state
const activeDigit = ref(0)
const decimals    = ref(0)
const intPart     = ref('0')
const decChars    = ref<string[]>([])
const fontSizePx  = ref('18px')
const fontFamily  = ref('Arial, sans-serif')
const fontWeight  = ref('normal')

// buffer for digit input: user types digits that replace the active segment
let inputBuffer = ''

// ── positioning ────────────────────────────────────────────────────────────

function calcPosition() {
  const el = target.value
  if (!el || !props.fabricCanvas || !props.canvasEl || !props.wrapperEl) return

  const fc   = props.fabricCanvas
  const zoom = fc.getZoom()
  const vpt  = fc.viewportTransform ?? [1, 0, 0, 1, 0, 0]
  const center = el.getCenterPoint()

  const rect = el.getControlRect()
  const elW  = rect.width  * (el.scaleX ?? 1) * zoom
  const elH  = rect.height * (el.scaleY ?? 1) * zoom

  const screenX = center.x * zoom + vpt[4]
  const screenY = center.y * zoom + vpt[5]

  const canvasRect = props.canvasEl.getBoundingClientRect()
  const wrapRect   = props.wrapperEl.getBoundingClientRect()
  const ox = canvasRect.left - wrapRect.left
  const oy = canvasRect.top  - wrapRect.top

  const cx = screenX + (rect.offsetX ?? 0) * (el.scaleX ?? 1) * zoom
  const cy = screenY + (rect.offsetY ?? 0) * (el.scaleY ?? 1) * zoom

  containerStyle.value = {
    left:   `${ox + cx - elW / 2}px`,
    top:    `${oy + cy - elH / 2}px`,
    width:  `${elW}px`,
    height: `${elH}px`,
  }

  fontSizePx.value = `${(el.customProps.fontSize ?? 18) * (el.scaleY ?? 1) * zoom}px`
  fontFamily.value = el.customProps.fontFamily ?? 'Arial, sans-serif'
  fontWeight.value = el.customProps.fontWeight ?? 'normal'
}

function syncFromTarget() {
  const el = target.value
  if (!el) return

  activeDigit.value = el.activeDigit
  decimals.value    = el.decimals

  const formatted = el.getFormattedValue() as string
  const dotIdx    = formatted.indexOf('.')
  intPart.value   = dotIdx >= 0 ? formatted.slice(0, dotIdx) : formatted
  decChars.value  = dotIdx >= 0 ? formatted.slice(dotIdx + 1).split('') : []

  inputBuffer = ''
}

// ── public API ─────────────────────────────────────────────────────────────

function activate(element: any) {
  target.value = element
  visible.value = true
  element.setEditingVisual(true)
  syncFromTarget()
  calcPosition()
}

function deactivate() {
  if (target.value) {
    target.value.deactivate()
    target.value = null
  }
  visible.value = false
  inputBuffer = ''
}

function refresh() {
  if (!visible.value) return
  syncFromTarget()
  calcPosition()
}

defineExpose({ activate, deactivate, refresh })

// ── keyboard handling ──────────────────────────────────────────────────────

function onKeyDown(e: KeyboardEvent) {
  if (!visible.value || !target.value) return

  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  const el = target.value

  // digit input — replace active segment
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault()
    inputBuffer += e.key

    if (el.activeDigit === 0) {
      // replacing integer part: accumulate digits
      const newInt = parseInt(inputBuffer, 10)
      const dec    = el.decimals > 0
        ? el.customProps.value - Math.trunc(el.customProps.value)
        : 0
      el.customProps.value = round(newInt + dec, el.decimals)
    } else {
      // replacing a single decimal digit
      const digitIndex = el.activeDigit - 1  // 0-based index in decimal string
      const decStr = el.customProps.value.toFixed(el.decimals).split('.')[1] ?? ''
      const chars  = decStr.split('')
      chars[digitIndex] = e.key
      const newDec = parseFloat('0.' + chars.join(''))
      const intVal = Math.trunc(el.customProps.value)
      el.customProps.value = round(intVal + (intVal >= 0 ? newDec : -newDec), el.decimals)
    }

    el.updateFromProps()
    el.emitStatePublic?.()
    syncFromTarget()
    return
  }

  // minus sign for integer part
  if (e.key === '-' && el.activeDigit === 0) {
    e.preventDefault()
    el.customProps.value = -el.customProps.value
    el.updateFromProps()
    el.emitStatePublic?.()
    syncFromTarget()
    return
  }

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      inputBuffer = ''
      el.nextDigit()
      syncFromTarget()
      break
    case 'ArrowLeft':
      e.preventDefault()
      inputBuffer = ''
      el.prevDigit()
      syncFromTarget()
      break
    case 'ArrowUp':
      e.preventDefault()
      inputBuffer = ''
      el.stepUp()
      syncFromTarget()
      break
    case 'ArrowDown':
      e.preventDefault()
      inputBuffer = ''
      el.stepDown()
      syncFromTarget()
      break
    case 'Escape':
    case 'Enter':
      e.preventDefault()
      deactivate()
      break
    case 'Backspace':
      e.preventDefault()
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1)
        // revert to previous value for integer part
        if (el.activeDigit === 0) {
          const newInt = inputBuffer.length > 0 ? parseInt(inputBuffer, 10) : 0
          const dec    = el.decimals > 0
            ? el.customProps.value - Math.trunc(el.customProps.value)
            : 0
          el.customProps.value = round(newInt + dec, el.decimals)
          el.updateFromProps()
          syncFromTarget()
        }
      }
      break
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
</script>
