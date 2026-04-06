<template>
  <div v-bind="$attrs" class="w-80 bg-gray-50 border-l p-4 overflow-y-auto text-sm">
    <template v-if="sel">
      <h2 class="font-semibold text-lg mb-3 capitalize">{{ sel.elementType }}</h2>

      <!-- layer controls -->
      <details open class="mb-4">
        <summary class="cursor-pointer font-medium mb-1">Слой</summary>
        <div class="flex items-center gap-2 mb-2">
          <n-button size="tiny" secondary @click="moveForward" :disabled="layerIndex >= maxLayer">
            <template #icon><n-icon><ArrowUp/></n-icon></template>
          </n-button>
          <n-button size="tiny" secondary @click="moveBackward" :disabled="layerIndex <= 0">
            <template #icon><n-icon><ArrowDown/></n-icon></template>
          </n-button>
          <n-input-number v-model:value="layerIndex" :min="0" :max="maxLayer" size="small" class="flex-1" @update:value="setLayer" />
        </div>
      </details>

      <!-- properties -->
      <details open class="mb-4">
        <summary class="cursor-pointer font-medium mb-1">Свойства</summary>

        <!-- explicit label + label font size editor (shows only if element supports label) -->
        <div v-if="propsProxy.label !== undefined" class="mb-3">
          <label class="block mb-1">Label</label>
          <n-input v-model:value="propsProxy.label" size="small" @update:value="applyProps" />

          <label class="block mb-1 mt-2">Label font size</label>
          <n-input-number
            v-model:value="propsProxy.labelFontSize"
            :min="6"
            :max="48"
            size="small"
            @update:value="applyProps"
          />
        </div>

        <!-- Шрифт и жирность (специальные поля) -->
        <div v-if="propsProxy.fontFamily !== undefined" class="mb-3">
          <label class="block mb-1">Шрифт</label>
          <n-select
            v-model:value="propsProxy.fontFamily"
            :options="fontFamilyOptions"
            size="small"
            filterable
            @update:value="applyProps"
          />
        </div>

        <div v-if="propsProxy.fontWeight !== undefined" class="mb-3">
          <label class="block mb-1">Насыщенность шрифта</label>
          <n-select
            v-model:value="propsProxy.fontWeight"
            :options="fontWeightOptions"
            size="small"
            @update:value="applyProps"
          />
        </div>

        <!-- general props (exclude label & labelFontSize & font properties to avoid duplicates) -->
        <div v-for="key in filteredKeys" :key="key" class="mb-2">
          <label class="block mb-1">{{ key }}</label>

          <n-color-picker
            v-if="looksLikeColor(propsProxy[key], key)"
            v-model:value="propsProxy[key]"
            :show-alpha="true"
            size="small"
            class="mb-1"
            @update:value="applyProps"
          />

          <n-input
            v-else
            v-model:value="propsProxy[key]"
            size="small"
            @update:value="applyProps"
          />
        </div>

        <n-button size="tiny" type="primary" @click="applyProps">Применить</n-button>
      </details>

      <!-- toggle control -->
      <details v-if="sel?.elementType === 'toggle'" open class="mb-4">
        <summary class="cursor-pointer font-medium mb-1">Управление переключателем</summary>
        <div class="mb-3">
          <p class="text-sm mb-2">Текущее состояние: <strong>{{ getToggleState() ? 'ВКЛ' : 'ВЫКЛ' }}</strong></p>
          <n-button @click="toggleElementState" type="primary" size="small" class="w-full">Сменить состояние</n-button>
        </div>
      </details>

      <!-- numControl value & step -->
      <details v-if="sel?.elementType === 'numControl'" open class="mb-4">
        <summary class="cursor-pointer font-medium mb-1">Значение и шаг</summary>
        <div class="mb-2">
          <label class="block mb-1">Значение</label>
          <n-input-number v-model:value="propsProxy.value" size="small" @update:value="applyProps" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Шаг</label>
          <n-input-number v-model:value="propsProxy.step" :min="0.0001" :step="0.1" size="small" @update:value="applyProps" />
        </div>
      </details>

      <!-- graph scale controls -->
      <details v-if="sel?.elementType === 'time-graph'" open class="mb-4">
        <summary class="cursor-pointer font-medium mb-1">Шкалы графика</summary>
        <div class="mb-2">
          <label class="block mb-1">Макс. значение (Y)</label>
          <n-input-number v-model:value="propsProxy.yMax" :min="1" size="small" @update:value="applyProps" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Шаг по Y</label>
          <n-input-number v-model:value="propsProxy.yStep" :min="1" size="small" @update:value="applyProps" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Шаг по времени (сек)</label>
          <n-input-number v-model:value="propsProxy.timeStep" :min="0.1" :step="0.5" size="small" @update:value="applyProps" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Точек на шкале времени</label>
          <n-input-number v-model:value="propsProxy.timePoints" :min="2" :max="200" size="small" @update:value="applyProps" />
        </div>
      </details>

      <!-- bindings -->
      <n-tabs type="card" size="small" animated>
        <n-tab-pane name="inputs" tab="Входы (read)">
          <div v-if="inputs.length">
            <div v-for="pin in inputs" :key="pin" class="mb-2">
              <label class="block mb-1">{{ pin }}</label>
              <n-select 
                :options="backendOutputsOptions" 
                :render-label="renderOption"
                v-model:value="bindings.inputs[pin]" 
                placeholder="— не привязано —" 
                filterable 
                clearable 
                size="small" 
              />
            </div>
          </div>
          <p v-else class="text-gray-400">Нет входных пинов</p>
        </n-tab-pane>

        <n-tab-pane name="outputs" tab="Выходы (write)">
          <div v-if="outputs.length">
            <div v-for="pin in outputs" :key="pin" class="mb-2">
              <label class="block mb-1">{{ pin }}</label>
              <n-select 
                :options="backendInputsOptions" 
                :render-label="renderOption"
                v-model:value="bindings.outputs[pin]" 
                placeholder="— не привязано —" 
                filterable 
                clearable 
                size="small"
              />
            </div>
          </div>
          <p v-else class="text-gray-400">Нет выходных пинов</p>
        </n-tab-pane>
      </n-tabs>
    </template>

    <p v-else class="text-gray-400">Выделите объект для редактирования</p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, h } from 'vue'
import {
  NInput,
  NButton,
  NTabs,
  NTabPane,
  NSelect,
  NIcon,
  NInputNumber,
  NColorPicker
} from 'naive-ui'
import { ArrowUp, ArrowDown } from '@vicons/ionicons5'
import type { fabric } from 'fabric'
import { useSessionStore } from '../store/session'

function looksLikeColor(val: any, key = ''): boolean {
  return typeof val === 'string' &&
    (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val) ||
      /^rgba?/.test(val) ||
      key.toLowerCase().includes('color') ||
      key.toLowerCase() === 'stroke')
}

const props = defineProps<{ selected: fabric.Object | null }>()
const sel = computed(() => props.selected)

const layerIndex = ref(0)
const maxLayer = ref(0)

function renderOption(option: any) {
  return h(
    'span',
    { title: option.title },
    option.label
  )
}

watch(
  sel,
  s => {
    if (s?.canvas) {
      const objs = s.canvas.getObjects()
      layerIndex.value = objs.indexOf(s)
      maxLayer.value = objs.length - 1
    } else {
      layerIndex.value = 0
      maxLayer.value = 0
    }
  },
  { immediate: true }
)

function setLayer(idx: number | null) {
  if (idx === null || !sel.value) return
  const canvas = sel.value.canvas
  if (!canvas) return

  const newIdx = Math.max(0, Math.min(idx, canvas.getObjects().length - 1))
  sel.value.moveTo(newIdx)
  canvas.requestRenderAll()
  layerIndex.value = newIdx
}

function moveForward() {
  setLayer(layerIndex.value + 1)
}

function moveBackward() {
  setLayer(layerIndex.value - 1)
}

function getToggleState(): boolean {
  if (sel.value?.elementType === 'toggle') {
    return (sel.value as any).getState?.() ?? false
  }
  return false
}

function toggleElementState() {
  if (sel.value?.elementType === 'toggle') {
    (sel.value as any).toggleState?.()
    sel.value.canvas?.requestRenderAll()
  }
}

/* propsProxy handling */
const propsProxy = reactive<Record<string, any>>({})
watch(
  sel,
  s => {
    Object.keys(propsProxy).forEach(k => delete propsProxy[k])
    if (s?.customProps) Object.assign(propsProxy, JSON.parse(JSON.stringify(s.customProps)))
  },
  { immediate: true }
)

function applyProps() {
  if (!sel.value) return
  sel.value.customProps = { ...propsProxy }
  ;(sel.value as any).updateFromProps?.()
  sel.value.canvas?.requestRenderAll()
}

/* filtered keys to avoid duplicate label controls */
const filteredKeys = computed(() => 
  Object.keys(propsProxy).filter(k => 
    k !== 'label' && 
    k !== 'labelFontSize' && 
    k !== 'fontFamily' && 
    k !== 'fontWeight' &&
    // graph scale props are shown in dedicated section
    !(sel.value?.elementType === 'time-graph' && ['yMax', 'yStep', 'timeStep', 'timePoints', 'width', 'height'].includes(k)) &&
    // numControl value & step shown in dedicated section
    !(sel.value?.elementType === 'numControl' && ['value', 'step'].includes(k))
  )
)

/* bindings */
const ss = useSessionStore()

function buildGroupedOptions(groups: { label: string; vars: Record<string, any> }[]) {
  return groups
    .filter(g => Object.keys(g.vars).length > 0)
    .map(g => ({
      type: 'group' as const,
      label: g.label,
      key: g.label,
      children: Object.keys(g.vars).map(k => {
        const shortName = k.split('.').slice(2).join('.') || k
        return { label: shortName, value: k, title: k }
      }),
    }))
}

const backendInputsOptions = computed(() => buildGroupedOptions(ss.controlGroups))
const backendOutputsOptions = computed(() => buildGroupedOptions(ss.indicatorGroups))

const inputs = computed<string[]>(() => sel.value?.meta?.inputs ?? [])
const outputs = computed<string[]>(() => sel.value?.meta?.outputs ?? [])

const bindings = reactive<{ inputs: Record<string, string>; outputs: Record<string, string> }>({ inputs: {}, outputs: {} })

watch(sel, s => {
    if (s && typeof (s as any).getBindings === 'function') {
        const savedBindings = (s as any).getBindings()
        bindings.inputs = savedBindings?.inputs ?? {}
        bindings.outputs = savedBindings?.outputs ?? {}
    } else if (s?.bindings) {
        bindings.inputs = s.bindings.inputs ?? {}
        bindings.outputs = s.bindings.outputs ?? {}
    } else {
        bindings.inputs = {}
        bindings.outputs = {}
    }
}, { immediate: true })

watch(bindings, () => {
    if (!sel.value) return
    // Используем метод setBindings вместо прямого присваивания
    if (typeof (sel.value as any).setBindings === 'function') {
        (sel.value as any).setBindings(JSON.parse(JSON.stringify(bindings)))
    } else {
        // fallback для обратной совместимости
        sel.value.bindings = JSON.parse(JSON.stringify(bindings))
    }
}, { deep: true })

watch(propsProxy, () => {
  if (sel.value && typeof (sel.value as any).updateFromProps === 'function') {
    sel.value.customProps = { ...propsProxy }
    ;(sel.value as any).updateFromProps()
  }
}, { deep: true })

/* Опции для шрифтов */
const fontFamilyOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
]

const fontWeightOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
  { label: '900 (Black)', value: '900' },
]
</script>

<style scoped>
details > summary { list-style: none; }
details > summary::-webkit-details-marker { display: none; }
</style>