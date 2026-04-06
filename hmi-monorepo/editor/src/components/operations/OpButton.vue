<template>
  <button
      class="rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      :class="[
        stretch ? 'w-full' : 'w-auto',
        active ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : '',
        isCompact ? 'flex items-center justify-center p-1.5' : (isVertical ? 'flex flex-col items-center gap-1 px-2 py-2' : 'flex items-center gap-2 px-3 py-2')
      ]"
      :title="tooltip"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="trigger"
  >
    <IconRenderer :icon="iconName" :class="isCompact ? 'h-5 w-5' : (isVertical ? 'h-5 w-5' : 'h-4 w-4 flex-shrink-0')" />
    <div v-if="!isCompact" :class="isVertical ? 'flex flex-col items-center text-center leading-tight' : 'flex flex-col text-left leading-tight'">
      <span>{{ label }}</span>
      <span v-if="hotkey" class="text-[10px] uppercase tracking-wide text-gray-400">{{ hotkey }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {executeCommand, getCommand} from '../../commands'
import type {CommandId} from '../../commands/types'
import {IconMap} from '../../icons/IconMap'
import IconRenderer from '../icons/IconRenderer.vue'

const props = defineProps<{
  commandId: CommandId
  disabled?: boolean
  active?: boolean
  layout?: 'vertical' | 'horizontal'
  stretch?: boolean
  compact?: boolean
}>()

const command = computed(() => getCommand(props.commandId))
const label = computed(() => command.value.label)
const hotkey = computed(() => command.value.hotkey ?? '')
const iconName = computed(() => IconMap[props.commandId])

const tooltip = computed(() => hotkey.value ? `${label.value} (${hotkey.value})` : label.value)
const ariaLabel = computed(() => tooltip.value)

const disabled = computed(() => props.disabled ?? false)
const active = computed(() => props.active ?? false)
const isVertical = computed(() => (props.layout ?? 'vertical') === 'vertical')
const stretch = computed(() => props.stretch ?? true)
const isCompact = computed(() => props.compact ?? false)

function trigger() {
  if (disabled.value) return
  executeCommand(props.commandId)
}
</script>
