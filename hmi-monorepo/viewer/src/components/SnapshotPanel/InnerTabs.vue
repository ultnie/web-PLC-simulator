<template>
  <n-tabs v-model:value="inner" justify-content="space-evenly" type="line" size="small">
    <n-tab-pane v-for="k in keys" :key="k" :name="k" :tab="k">
      <n-data-table
          :columns="columns"
          :data="rows(snap[k])"
          :bordered="false"
          size="small"
          :single-line="false"/>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {NTabs, NTabPane, NDataTable} from 'naive-ui'

const props = defineProps<{ snap: Record<string, any> }>()
const keys = ['inputs', 'outputs', 'states', 'times', 'global_vars', 'vars'] as const
const inner = ref<typeof keys[number]>('inputs')

const columns = [
  {title: 'Название', key: 'key', ellipsis: true},
  {title: 'Значение', key: 'val'}
]

function rows(obj: Record<string, any>) {
  if (!obj) return []
  return Object.entries(obj).map(([key, val]) => ({key, val: JSON.stringify(val)}))
}
</script>
