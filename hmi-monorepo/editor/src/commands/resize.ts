import type {CommandDefinition} from './types'
import {commitCanvasChange, getActiveSelection, getBoundingRect, withCanvas} from './utils'

function resize(mode: 'width' | 'height' | 'both') {
    return withCanvas(canvas => {
        const {objects} = getActiveSelection(canvas)
        if (objects.length < 2) return false

        const reference = objects[0]
        const rect = getBoundingRect(reference)
        const targetWidth = rect.width
        const targetHeight = rect.height

        objects.slice(1).forEach(obj => {
            if (mode === 'width' || mode === 'both') {
                if (targetWidth > 0 && typeof obj.scaleToWidth === 'function') {
                    obj.scaleToWidth(targetWidth)
                }
            }
            if (mode === 'height' || mode === 'both') {
                if (targetHeight > 0 && typeof obj.scaleToHeight === 'function') {
                    obj.scaleToHeight(targetHeight)
                }
            }
            obj.setCoords()
        })

        commitCanvasChange(canvas)
        return true
    })
}

const enabled = () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2)

export const resizeCommands: CommandDefinition[] = [
    {
        id: 'resize:match-width',
        section: 'resize',
        label: 'Match Width',
        hotkey: 'ctrl+shift+w',
        run: () => resize('width'),
        isEnabled: enabled,
    },
    {
        id: 'resize:match-height',
        section: 'resize',
        label: 'Match Height',
        hotkey: 'ctrl+shift+h',
        run: () => resize('height'),
        isEnabled: enabled,
    },
    {
        id: 'resize:match-both',
        section: 'resize',
        label: 'Match Size',
        hotkey: 'ctrl+shift+b',
        run: () => resize('both'),
        isEnabled: enabled,
    },
]
