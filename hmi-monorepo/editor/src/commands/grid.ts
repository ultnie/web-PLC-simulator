import type {CommandDefinition} from './types'
import {getRuntimeContext} from './utils'

export const gridCommands: CommandDefinition[] = [
    {
        id: 'grid:toggle',
        section: 'grid',
        label: 'Toggle Grid',
        hotkey: 'ctrl+`',
        run: () => {
            const {store} = getRuntimeContext()
            store.toggleGrid()
        },
        isActive: () => getRuntimeContext().store.grid.showGrid,
    },
    {
        id: 'grid:snap',
        section: 'grid',
        label: 'Snap to Grid',
        hotkey: 'ctrl+alt+`',
        run: () => {
            const {store} = getRuntimeContext()
            store.toggleSnap()
        },
        isEnabled: () => getRuntimeContext().store.grid.showGrid,
        isActive: () => getRuntimeContext().store.grid.snapToGrid,
    },
    {
        id: 'grid:guides',
        section: 'grid',
        label: 'Show Guides',
        hotkey: 'ctrl+;',
        run: () => {
            const {store} = getRuntimeContext()
            store.toggleGuides()
        },
        isActive: () => getRuntimeContext().store.grid.showGuides,
    },
]
