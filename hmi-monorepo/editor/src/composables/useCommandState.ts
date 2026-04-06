import {computed} from 'vue'
import type {CommandDefinition} from '../commands/types'
import {getRuntimeContext} from '../commands/utils'
import {useCanvasStore} from '../store/canvas'

export function useCommandState() {
    const store = useCanvasStore()
    const selectionTracker = computed(() => store.selection.count)
    const gridTracker = computed(() => ({
        show: store.grid.showGrid,
        snap: store.grid.snapToGrid,
        guides: store.grid.showGuides,
    }))
    const viewTracker = computed(() => ({
        zoom: store.view.zoom,
        offsetX: store.view.offsetX,
        offsetY: store.view.offsetY,
    }))

    function evaluate<T>(cmd: CommandDefinition, extractor: (cmd: CommandDefinition, ctx: ReturnType<typeof getRuntimeContext>) => T, fallback: T): T {
        selectionTracker.value
        gridTracker.value
        viewTracker.value
        const ctx = getRuntimeContext()
        return extractor(cmd, ctx) ?? fallback
    }

    function isCommandDisabled(cmd: CommandDefinition) {
        if (!cmd.isEnabled) return false
        return !evaluate(cmd, (definition, ctx) => definition.isEnabled?.(ctx) ?? true, true)
    }

    function isCommandActive(cmd: CommandDefinition) {
        if (!cmd.isActive) return false
        return Boolean(evaluate(cmd, (definition, ctx) => definition.isActive?.(ctx) ?? false, false))
    }

    return {isCommandDisabled, isCommandActive}
}
