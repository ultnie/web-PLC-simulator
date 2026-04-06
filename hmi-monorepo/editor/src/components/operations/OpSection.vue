<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <button
        type="button"
        class="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        @click="emit('toggle')"
    >
      <span>{{ title }}</span>
      <svg
          class="h-4 w-4 transition-transform"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="open ? 'rotate-180' : ''"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div v-if="open" class="border-t border-gray-100 px-3 py-3">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{ title: string; open: boolean }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const open = computed(() => props.open)
const title = computed(() => props.title)
</script>
