<template>
  <div v-bind="$attrs">
    <n-radio-group
        v-model:value="mode"
        class="mb-4"
        size="small"
    >
      <n-radio-button value="runtime">Тестирование</n-radio-button>
      <n-radio-button value="design">Редактирование</n-radio-button>
    </n-radio-group>
    
    <div class="w-64 bg-gray-100 p-4 overflow-y-auto space-y-2 border-r" style="max-height: 600px;">
      <div 
        v-for="(categoryData, categoryKey) in paletteWithSubcategories" 
        :key="categoryKey"
        class="border border-gray-300 rounded bg-white overflow-hidden mb-2"
      >
        <div 
          class="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
          @click="toggleCategory(categoryKey)"
        >
          <h2 class="font-semibold capitalize">{{ getCategoryDisplayName(categoryKey) }}</h2>
          <span class="text-gray-600 text-lg transition-transform" :class="{ 'rotate-180': expandedCategory === categoryKey }">
            ▼
          </span>
        </div>
        
        <div v-if="expandedCategory === categoryKey" class="p-2 space-y-2 border-t border-gray-200">
          <template v-if="categoryData.hasSubcategories">
            <div v-if="categoryData.subcategories.controls?.length" class="border border-gray-200 rounded overflow-hidden">
              <div 
                class="flex items-center justify-between px-3 py-1.5 bg-gray-100 text-sm cursor-pointer hover:bg-gray-200 transition"
                @click.stop="toggleSubcategory(categoryKey, 'controls')"
              >
                <span class="font-medium">Controls</span>
                <span class="text-gray-600 text-sm transition-transform" :class="{ 'rotate-180': expandedSubcategory[`${categoryKey}-controls`] }">
                  ▼
                </span>
              </div>
              <div v-if="expandedSubcategory[`${categoryKey}-controls`]" class="p-1 space-y-1">
                <button
                  v-for="s in categoryData.subcategories.controls"
                  :key="s.key"
                  draggable="true"
                  @dragstart="e => e.dataTransfer?.setData('shape', s.key)"
                  class="block w-full px-3 py-1.5 bg-white rounded shadow-sm text-left hover:bg-gray-50 active:scale-95 transition text-sm"
                >
                  {{ getElementDisplayName(s.key) }}
                </button>
              </div>
            </div>

            <div v-if="categoryData.subcategories.indicators?.length" class="border border-gray-200 rounded overflow-hidden">
              <div 
                class="flex items-center justify-between px-3 py-1.5 bg-gray-100 text-sm cursor-pointer hover:bg-gray-200 transition"
                @click.stop="toggleSubcategory(categoryKey, 'indicators')"
              >
                <span class="font-medium">Indicators</span>
                <span class="text-gray-600 text-sm transition-transform" :class="{ 'rotate-180': expandedSubcategory[`${categoryKey}-indicators`] }">
                  ▼
                </span>
              </div>
              <div v-if="expandedSubcategory[`${categoryKey}-indicators`]" class="p-1 space-y-1">
                <button
                  v-for="s in categoryData.subcategories.indicators"
                  :key="s.key"
                  draggable="true"
                  @dragstart="e => e.dataTransfer?.setData('shape', s.key)"
                  class="block w-full px-3 py-1.5 bg-white rounded shadow-sm text-left hover:bg-gray-50 active:scale-95 transition text-sm"
                >
                  {{ getElementDisplayName(s.key) }}
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <button
              v-for="s in categoryData.items"
              :key="s.key"
              draggable="true"
              @dragstart="e => e.dataTransfer?.setData('shape', s.key)"
              class="block w-full px-3 py-1.5 bg-white rounded shadow-sm text-left hover:bg-gray-50 active:scale-95 transition text-sm"
            >
              {{ getElementDisplayName(s.key) }}
            </button>
          </template>

          <div v-if="!categoryData.items.length && !categoryData.hasSubcategories" class="text-gray-400 text-sm italic px-2 py-1">
            Нет элементов
          </div>
        </div>
      </div>
    </div>

    <hr class="my-3"/>

    <n-button block secondary size="small" class="mb-2" @click="doSave">
      Сохранить (JSON)
    </n-button>
    <n-button block tertiary size="small" @click="openFileDialog">
      Загрузить...
    </n-button>
    <input
        type="file"
        accept=".json"
        ref="fileInp"
        class="hidden"
        @change="onFile"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {NButton} from 'naive-ui'
import {fabric} from 'fabric'
import {useCanvas, setSuppressSnapshots, resetHistory} from '../composables/useCanvas'
import {ElementRegistry} from '../elements'
import {useCanvasStore} from '../store/canvas'

const {canvas} = useCanvas()
const canvasStore = useCanvasStore()

const expandedCategory = ref<string | null>(null)

const expandedSubcategory = ref<Record<string, boolean>>({})

const elementDisplayNames: Record<string, string> = {
  'numInput': 'Numeric Input',
  'numControl': 'Numeric Stepper',
  'numDisplay': 'Numeric Indicator',
  'toggle': 'Slide Switch',
  'slider': 'slider',
  'button': 'Кнопка',
  'text': 'Текст',
  'image': 'Image',
  'led': 'Round LED',
  'gauge': 'Стрелочный индикатор',
  'progress': 'Прогресс-бар',
  'time-graph': 'График времени',
  'trend': 'Тренд',
  'rectangle': 'Прямоугольник',
  'circle': 'Круг',
  'line': 'Line',
  'container': 'Контейнер',
  'graph': 'Time Graph',
  'analog-input': 'Аналоговый ввод',
  'digital-input': 'Дискретный ввод',
  'meter': 'Измеритель',
  'knob': 'Ручка',
  'switch': 'Выключатель',
  'indicator': 'Индикатор',
  'chart': 'Диаграмма',
  'thermometer': 'Термометр',
  'tank': 'Tank',
}

const categoryDisplayNames: Record<string, string> = {
  'numeric': 'numeric',
  'boolean': 'boolean',
  'graph': 'graph',
  'decorations': 'decorations',
  'ring': 'ring',
  'layout': 'layout',
}

function getElementDisplayName(elementKey: string): string {
  return elementDisplayNames[elementKey] || elementKey
}

function getCategoryDisplayName(categoryKey: string): string {
  return categoryDisplayNames[categoryKey] || categoryKey
}

const palette: Record<string, any[]> = {
  numeric: [],
  boolean: [],
  graph: [],
  decorations: [],
  ring: [],
  layout: [],
}

Object.entries(ElementRegistry).forEach(([key, ctor]) => {
  const category = (ctor as any).category || 'decorations'
  const elementType = (ctor as any).elementType || key
  const subcategory = (ctor as any).subcategory
  
  if (palette.hasOwnProperty(category)) {
    palette[category].push({
      key,
      label: elementType,
      subcategory,
    })
  } else {
    console.warn(`Category "${category}" not found in palette, adding to decorations`)
    palette.decorations.push({
      key,
      label: elementType,
      subcategory,
    })
  }
})

const paletteWithSubcategories = computed(() => {
  const result: Record<string, any> = {}
  
  Object.entries(palette).forEach(([categoryKey, items]) => {
    const hasSubcategories = items.some(item => item.subcategory)
    
    if (hasSubcategories) {
      const subcategories: Record<string, any[]> = {
        controls: [],
        indicators: []
      }
      
      const itemsWithoutSubcategory: any[] = []
      
      items.forEach(item => {
        if (item.subcategory === 'controls') {
          subcategories.controls.push(item)
        } else if (item.subcategory === 'indicators') {
          subcategories.indicators.push(item)
        } else {
          itemsWithoutSubcategory.push(item)
        }
      })
      
      result[categoryKey] = {
        hasSubcategories: true,
        subcategories,
        items: itemsWithoutSubcategory
      }
    } else {
      result[categoryKey] = {
        hasSubcategories: false,
        items
      }
    }
  })
  
  return result
})

function toggleCategory(categoryKey: string) {
  if (expandedCategory.value === categoryKey) {
    expandedCategory.value = null
  } else {
    expandedCategory.value = categoryKey
    expandedSubcategory.value = {}
  }
}

function toggleSubcategory(categoryKey: string, subcategoryKey: string) {
  const key = `${categoryKey}-${subcategoryKey}`
  expandedSubcategory.value[key] = !expandedSubcategory.value[key]
}

onMounted(() => {
  const firstCategory = Object.keys(palette)[0]
  if (firstCategory) {
    expandedCategory.value = firstCategory
  }
})

const fileInp = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  fileInp.value?.click()
}

function doSave() {
  if (!canvas.value) return
  const hmi = {
    meta: {version: '1.0', created: new Date().toISOString()},
    canvas: canvas.value.toJSON(['id', 'customProps', 'elementType', 'bindings', 'meta']),
    bindings: canvas.value.getObjects().map((o: fabric.Object & {id?: string; bindings?: any}) => ({
      elementId: o.id,
      inputBindings: o.bindings?.inputs ?? {},
      outputBindings: o.bindings?.outputs ?? {},
    })),
    view: canvasStore.serializeView(),
    grid: {
      showGrid: canvasStore.grid.showGrid,
      snapToGrid: canvasStore.grid.snapToGrid,
      showGuides: canvasStore.grid.showGuides,
    },
  }
  const blob = new Blob([JSON.stringify(hmi, null, 2)], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = 'screen.hmi.json'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f || !canvas.value) return
  f.text().then(text => {
    const json = JSON.parse(text)
    const currentCanvas = canvas.value
    if (!currentCanvas) return
    setSuppressSnapshots(true)
    currentCanvas.clear()
    fabric.util.enlivenObjects(json.canvas.objects ?? [], (objs: fabric.Object[]) => {
      objs.forEach(obj => currentCanvas.add(obj))
      currentCanvas.renderAll()
      if (json.view) {
        canvasStore.setViewportTransform(json.view)
      }
      if (json.grid) {
        canvasStore.setGridState({
          showGrid: Boolean(json.grid.showGrid),
          snapToGrid: Boolean(json.grid.snapToGrid),
          showGuides: Boolean(json.grid.showGuides),
        })
      }
      setSuppressSnapshots(false)
      resetHistory()
    }, 'fabric')
  })
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #9ca3af #e5e7eb;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>