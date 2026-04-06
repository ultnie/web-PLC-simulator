<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <TopToolbar />
    <div class="flex flex-1 overflow-hidden">
      <LeftSidebar class="flex-shrink-0" />
      <CanvasComponent class="flex-1" />
      <RightSidebar :selected="selectedObject" class="flex-shrink-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LeftSidebar from './components/LeftSidebar.vue'
import CanvasComponent from './components/CanvasComponent.vue'
import RightSidebar from './components/RightSidebar.vue'
import TopToolbar from './components/TopToolbar.vue'
import { useCanvasStore } from './store/canvas'

const store = useCanvasStore()
const selectedObject = computed(() => store.selection.selectedObject)
</script>
