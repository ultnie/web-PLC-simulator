import type {CommandDefinition} from './types'
import {commitCanvasChange, getActiveSelection, getBoundingRect, withCanvas} from './utils'

function distribute(mode: 'horizontal' | 'vertical', strategy: 'center' | 'space') {
    return withCanvas(canvas => {
        const {objects} = getActiveSelection(canvas)
        if (objects.length < 2) return false

        const rects = objects.map(obj => ({obj, rect: getBoundingRect(obj)}))
        const sorted = rects.sort((a, b) =>
            mode === 'horizontal'
                ? a.rect.left - b.rect.left
                : a.rect.top - b.rect.top
        )

        const first = sorted[0].rect
        const last = sorted[sorted.length - 1].rect

        if (strategy === 'center') {
            const firstCenter = mode === 'horizontal'
                ? first.left + first.width / 2
                : first.top + first.height / 2
            const lastCenter = mode === 'horizontal'
                ? last.left + last.width / 2
                : last.top + last.height / 2
            const step = (lastCenter - firstCenter) / (sorted.length - 1)
            sorted.forEach(({obj, rect}, idx) => {
                if (idx === 0 || idx === sorted.length - 1) return
                if (mode === 'horizontal') {
                    const targetCenter = firstCenter + step * idx
                    const delta = targetCenter - (rect.left + rect.width / 2)
                    obj.set('left', (obj.left ?? 0) + delta)
                } else {
                    const targetCenter = firstCenter + step * idx
                    const delta = targetCenter - (rect.top + rect.height / 2)
                    obj.set('top', (obj.top ?? 0) + delta)
                }
                obj.setCoords()
            })
        } else {
            const totalSpan = mode === 'horizontal'
                ? last.left + last.width - first.left
                : last.top + last.height - first.top
            const totalSize = sorted.reduce((sum, {rect}) =>
                sum + (mode === 'horizontal' ? rect.width : rect.height), 0)
            const gap = (totalSpan - totalSize) / (sorted.length - 1)
            let cursor = mode === 'horizontal' ? first.left : first.top
            sorted.forEach(({obj, rect}, idx) => {
                if (idx === 0) {
                    cursor += (mode === 'horizontal' ? rect.width : rect.height) + gap
                    return
                }
                if (idx === sorted.length - 1) return
                if (mode === 'horizontal') {
                    const delta = cursor - rect.left
                    obj.set('left', (obj.left ?? 0) + delta)
                    cursor += rect.width + gap
                } else {
                    const delta = cursor - rect.top
                    obj.set('top', (obj.top ?? 0) + delta)
                    cursor += rect.height + gap
                }
                obj.setCoords()
            })
        }

        commitCanvasChange(canvas)
        return true
    })
}

const enabled = () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2)

export const distributeCommands: CommandDefinition[] = [
    {
        id: 'distribute:horizontal',
        section: 'distribute',
        label: 'Distribute Centers (H)',
        hotkey: 'alt+shift+h',
        run: () => distribute('horizontal', 'center'),
        isEnabled: enabled,
    },
    {
        id: 'distribute:vertical',
        section: 'distribute',
        label: 'Distribute Centers (V)',
        hotkey: 'alt+shift+v',
        run: () => distribute('vertical', 'center'),
        isEnabled: enabled,
    },
    {
        id: 'distribute:space-horizontal',
        section: 'distribute',
        label: 'Equal Gaps (H)',
        hotkey: 'alt+h',
        run: () => distribute('horizontal', 'space'),
        isEnabled: enabled,
    },
    {
        id: 'distribute:space-vertical',
        section: 'distribute',
        label: 'Equal Gaps (V)',
        hotkey: 'alt+v',
        run: () => distribute('vertical', 'space'),
        isEnabled: enabled,
    },
]
