<template>
  <n-tabs v-model:value="outer" justify-content="space-evenly" type="line" tab-style="min-width:160px">
    <n-tab-pane name="plc" tab="outputs">
      <InnerTabs :snap="plc"/>
    </n-tab-pane>
    <n-tab-pane name="plant" tab="plant_outputs">
      <InnerTabs :snap="plant"/>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {NTabs, NTabPane} from 'naive-ui'
import {useSessionStore} from '@/store/session'
import InnerTabs from './SnapshotPanel/InnerTabs.vue'

const outer = ref<'plc' | 'plant'>('plc')
const store = useSessionStore()
const plc = computed(() => store.plc)
const plant = computed(() => store.plant)
</script>
