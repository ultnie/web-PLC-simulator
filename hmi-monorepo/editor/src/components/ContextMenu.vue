<template>
  <Teleport to="body">
    <div 
      v-if="visible"
      class="simple-context-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @contextmenu.prevent
    >
      <button class="menu-btn" @click="$emit('appearance')">
        🎨 Внешний вид
      </button>
      <button class="menu-btn" @click="$emit('label-position')">
        📍 Расположение надписи
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  x: number
  y: number
}>()

defineEmits<{
  (e: 'appearance'): void
  (e: 'label-position'): void
  (e: 'close'): void
}>()
</script>

<style scoped>
.simple-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 4px;
  z-index: 9999;
  min-width: 180px;
}

.menu-btn {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  color: #1e293b;
}

.menu-btn:hover {
  background-color: #f1f5f9;
}
</style>