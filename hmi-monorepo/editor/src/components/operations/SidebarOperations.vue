<template>
  <aside class="w-[300px] max-w-sm border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto space-y-4 text-sm">
    <OpSection
        v-for="section in sections"
        :key="section.id"
        :title="section.title"
        :open="isSectionOpen(section.id)"
        @toggle="toggleSection(section.id)"
    >
      <div class="grid grid-cols-3 gap-2">
       <OpButton
            v-for="cmd in commandsBySection(section.id)"
            :key="cmd.id"
            :command-id="cmd.id"
            :disabled="isCommandDisabled(cmd)"
            :active="isCommandHighlighted(section.id, cmd)"
        />
      </div>
    </OpSection>
  </aside>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {SECTIONS, listCommandsBySection} from '../../commands'
import type {OperationSectionId} from '../../commands/types'
import {useCanvasStore} from '../../store/canvas'
import {useCommandState} from '../../composables/useCommandState'
import OpButton from './OpButton.vue'
import OpSection from './OpSection.vue'

const store = useCanvasStore()
const sections = computed(() => SECTIONS)
const {isCommandDisabled, isCommandActive} = useCommandState()
const lastCommand = computed(() => store.operations.lastCommand)

function isSectionOpen(id: OperationSectionId) {
  return store.operations.openSections.includes(id)
}

function toggleSection(id: OperationSectionId) {
  store.toggleSection(id)
}

function commandsBySection(section: OperationSectionId) {
  return listCommandsBySection(section)
}

function isCommandHighlighted(section: OperationSectionId, cmd: ReturnType<typeof commandsBySection>[number]) {
  return isCommandActive(cmd) || lastCommand.value[section] === cmd.id
}
</script>
