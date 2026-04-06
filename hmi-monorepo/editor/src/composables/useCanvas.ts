import {ref} from 'vue'
import type {fabric} from 'fabric'

const canvas = ref<fabric.Canvas | null>(null)

let _suppressSnapshots = false
let _resetHistoryFn: (() => void) | null = null

export function setCanvas(c: fabric.Canvas) {
    canvas.value = c
}

export function registerHistoryControls(resetFn: () => void) {
    _resetHistoryFn = resetFn
}

export function setSuppressSnapshots(v: boolean) {
    _suppressSnapshots = v
}

export function isSuppressed() {
    return _suppressSnapshots
}

export function resetHistory() {
    _resetHistoryFn?.()
}

export function useCanvas() {
    return {canvas}
}
