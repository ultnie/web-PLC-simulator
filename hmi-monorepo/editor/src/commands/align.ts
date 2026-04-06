import type {CommandDefinition} from './types'
import {commitCanvasChange, getActiveSelection, getBoundingRect, withCanvas} from './utils'

function align(mode: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle'): boolean {
    return withCanvas(canvas => {
        const {objects} = getActiveSelection(canvas)
        if (objects.length < 2) return false

        const rects = objects.map(obj => ({obj, rect: getBoundingRect(obj)}))
        const minX = Math.min(...rects.map(r => r.rect.left))
        const maxX = Math.max(...rects.map(r => r.rect.left + r.rect.width))
        const minY = Math.min(...rects.map(r => r.rect.top))
        const maxY = Math.max(...rects.map(r => r.rect.top + r.rect.height))
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        rects.forEach(({obj, rect}) => {
            let dx = 0
            let dy = 0
            switch (mode) {
                case 'left':
                    dx = minX - rect.left
                    break
                case 'right':
                    dx = maxX - (rect.left + rect.width)
                    break
                case 'center':
                    dx = centerX - (rect.left + rect.width / 2)
                    break
                case 'top':
                    dy = minY - rect.top
                    break
                case 'bottom':
                    dy = maxY - (rect.top + rect.height)
                    break
                case 'middle':
                    dy = centerY - (rect.top + rect.height / 2)
                    break
            }
            obj.set({
                left: (obj.left ?? 0) + dx,
                top: (obj.top ?? 0) + dy,
            })
            obj.setCoords()
        })

        commitCanvasChange(canvas)
        return true
    })
}

export const alignCommands: CommandDefinition[] = [
    {
        id: 'align:left',
        section: 'align',
        label: 'Align Left',
        hotkey: 'alt+left',
        run: () => align('left'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
    {
        id: 'align:center',
        section: 'align',
        label: 'Align Center',
        hotkey: 'alt+c',
        run: () => align('center'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
    {
        id: 'align:right',
        section: 'align',
        label: 'Align Right',
        hotkey: 'alt+right',
        run: () => align('right'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
    {
        id: 'align:top',
        section: 'align',
        label: 'Align Top',
        hotkey: 'alt+up',
        run: () => align('top'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
    {
        id: 'align:middle',
        section: 'align',
        label: 'Align Middle',
        hotkey: 'alt+m',
        run: () => align('middle'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
    {
        id: 'align:bottom',
        section: 'align',
        label: 'Align Bottom',
        hotkey: 'alt+down',
        run: () => align('bottom'),
        isEnabled: () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2),
    },
]
