<template>
  <header class="flex items-center gap-4 px-4 py-2 bg-white shadow">
    <h1 class="font-semibold">HMI Viewer</h1>
    <n-button @click="fileInp.click()" secondary size="small">
      Загрузить...
    </n-button>
    <input ref="fileInp" type="file" accept=".json,.hmi" class="hidden" @change="onPick"/>
    <span v-if="sessionId" class="text-xs text-gray-500">session: {{ sessionId }}</span>

    <div class="ml-auto flex items-center gap-4">
      <!-- Grid & Guides -->
      <div class="flex flex-col items-center gap-0.5">
        <div class="flex items-center gap-1">
          <ToolBtn title="Toggle Grid" :active="canvasStore.grid.showGrid" @click="canvasStore.toggleGrid()">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Snap to Grid" :active="canvasStore.grid.snapToGrid" :disabled="!canvasStore.grid.showGrid" @click="canvasStore.toggleSnap()">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="5" width="14" height="14" rx="2"/>
              <path d="M9 9h6v6H9z"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Show Guides" :active="canvasStore.grid.showGuides" @click="canvasStore.toggleGuides()">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="4" x2="12" y2="20"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <circle cx="12" cy="12" r="2.5"/>
            </svg>
          </ToolBtn>
        </div>
        <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Grid & Guides</span>
      </div>

      <!-- Zoom -->
      <div class="flex flex-col items-center gap-0.5">
        <div class="flex items-center gap-1">
          <ToolBtn title="Zoom In" @click="emit('zoom', 'in')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Zoom Out" @click="emit('zoom', 'out')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Reset View" :active="isResetActive" @click="emit('zoom', 'reset')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="7"/><path d="M12 5v4l3-2"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Actual Size" :active="isActualActive" @click="emit('zoom', 'actual')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </ToolBtn>
          <ToolBtn title="Fit to Screen" @click="emit('zoom', 'fit')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>
            </svg>
          </ToolBtn>
        </div>
        <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">Zoom</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {ref, computed, defineComponent, h} from 'vue'
import {NButton} from 'naive-ui'
import {useSessionStore} from '@/store/session'
import {useViewerCanvasStore} from '@/store/canvas'

const emit = defineEmits<{
  (e: 'load-hmi', f: File): void
  (e: 'zoom', action: 'in' | 'out' | 'reset' | 'actual' | 'fit'): void
}>()

const fileInp = ref<HTMLInputElement>()
const sessionStore = useSessionStore()
const canvasStore = useViewerCanvasStore()
const sessionId = computed(() => sessionStore.sessionId)

const isResetActive = computed(() =>
    Math.abs(canvasStore.view.zoom - 1) < 0.01 &&
    Math.abs(canvasStore.view.offsetX) < 1 &&
    Math.abs(canvasStore.view.offsetY) < 1
)
const isActualActive = computed(() => Math.abs(canvasStore.view.zoom - 1) < 0.01)

function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('load-hmi', f)
}

const ToolBtn = defineComponent({
  props: {
    title: String,
    active: Boolean,
    disabled: Boolean,
  },
  emits: ['click'],
  setup(props, {slots, emit: btnEmit}) {
    return () => h('button', {
      class: [
        'rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center p-1.5',
        props.active ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : '',
      ],
      title: props.title,
      disabled: props.disabled,
      onClick: () => btnEmit('click'),
    }, slots.default?.())
  },
})
</script>
