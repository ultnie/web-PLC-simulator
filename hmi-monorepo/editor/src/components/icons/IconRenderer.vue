<template>
  <svg
      :viewBox="iconDef.viewBox"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      :stroke-width="iconDef.strokeWidth ?? 1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="block"
  >
    <template v-for="(el, idx) in iconDef.elements" :key="idx">
      <line
          v-if="el.type === 'line'"
          :x1="el.x1"
          :y1="el.y1"
          :x2="el.x2"
          :y2="el.y2"
      />
      <rect
          v-else-if="el.type === 'rect'"
          :x="el.x"
          :y="el.y"
          :width="el.width"
          :height="el.height"
          :rx="el.rx ?? 0"
          :fill="el.fill ?? 'currentColor'"
          :stroke="el.fill === 'currentColor' ? 'none' : 'currentColor'"
      />
      <path
          v-else-if="el.type === 'path'"
          :d="el.d"
          :fill="el.fill ?? 'none'"
      />
      <circle
          v-else-if="el.type === 'circle'"
          :cx="el.cx"
          :cy="el.cy"
          :r="el.r"
          :fill="el.fill ?? 'none'"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {IconName} from '../../icons/icons'
import {getIcon} from '../../icons/icons'

const props = defineProps<{ icon: IconName }>()

const iconDef = computed(() => getIcon(props.icon))
</script>
