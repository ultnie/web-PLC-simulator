<template>
  <header class="border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
    <div class="flex items-start gap-6 overflow-x-auto">
      <div
          v-for="section in sections"
          :key="section.id"
          class="flex flex-col items-center gap-1"
      >
        <div class="flex items-center gap-1">
          <OpButton
              v-for="cmd in commandsBySection(section.id)"
              :key="cmd.id"
              :command-id="cmd.id"
              :disabled="isCommandDisabled(cmd)"
              :active="isCommandHighlighted(section.id, cmd)"
              layout="horizontal"
              :stretch="false"
              :compact="true"
          />
        </div>
        <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">{{ section.title }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {SECTIONS, listCommandsBySection} from '../commands'
import type {OperationSectionId} from '../commands/types'
import {useCommandState} from '../composables/useCommandState'
import OpButton from './operations/OpButton.vue'

const sections = computed(() => SECTIONS)
const {isCommandDisabled, isCommandActive} = useCommandState()

function commandsBySection(section: OperationSectionId) {
  return listCommandsBySection(section)
}

function isCommandHighlighted(_section: OperationSectionId, cmd: ReturnType<typeof commandsBySection>[number]) {
  return isCommandActive(cmd)
}
</script>
