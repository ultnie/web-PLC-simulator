import {ref} from 'vue'
import type {Canvas} from 'fabric'

const canvas = ref<Canvas>()

export const setCanvas = (c: Canvas) => (canvas.value = c)
export const useCanvas = () => ({canvas})
