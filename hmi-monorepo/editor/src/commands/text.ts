import {fabric} from 'fabric'
import type {CommandDefinition} from './types'
import {commitCanvasChange, getActiveSelection, getRuntimeContext, isTextObject, withCanvas} from './utils'

function applyToTexts(callback: (obj: fabric.Textbox | fabric.IText | fabric.Text) => void): boolean {
    return withCanvas(canvas => {
        const {objects} = getActiveSelection(canvas)
        const texts = objects.filter(isTextObject) as Array<fabric.Textbox | fabric.IText | fabric.Text>
        if (!texts.length) return false

        texts.forEach(t => {
            callback(t)
            t.setCoords()
        })
        commitCanvasChange(canvas)
        return true
    })
}

function everyText(predicate: (obj: fabric.Textbox | fabric.IText | fabric.Text) => boolean): boolean {
    const {canvas} = getRuntimeContext()
    if (!canvas) return false
    const {objects} = getActiveSelection(canvas)
    const texts = objects.filter(isTextObject) as Array<fabric.Textbox | fabric.IText | fabric.Text>
    if (!texts.length) return false
    return texts.every(predicate)
}

function hasTextSelection(): boolean {
    const {canvas} = getRuntimeContext()
    if (!canvas) return false
    const {objects} = getActiveSelection(canvas)
    return objects.some(isTextObject)
}

export const textCommands: CommandDefinition[] = [
    {
        id: 'text:bold',
        section: 'text',
        label: 'Bold',
        hotkey: 'ctrl+b',
        run: () => applyToTexts(obj => {
            const current = obj.fontWeight === 'bold'
            obj.set({fontWeight: current ? 'normal' : 'bold'})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => obj.fontWeight === 'bold'),
    },
    {
        id: 'text:italic',
        section: 'text',
        label: 'Italic',
        hotkey: 'ctrl+i',
        run: () => applyToTexts(obj => {
            const current = obj.fontStyle === 'italic'
            obj.set({fontStyle: current ? 'normal' : 'italic'})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => obj.fontStyle === 'italic'),
    },
    {
        id: 'text:underline',
        section: 'text',
        label: 'Underline',
        hotkey: 'ctrl+u',
        run: () => applyToTexts(obj => {
            obj.set({underline: !obj.underline})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => Boolean(obj.underline)),
    },
    {
        id: 'text:align-left',
        section: 'text',
        label: 'Align Left',
        hotkey: 'ctrl+shift+l',
        run: () => applyToTexts(obj => {
            obj.set({textAlign: 'left'})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => obj.textAlign === 'left'),
    },
    {
        id: 'text:align-center',
        section: 'text',
        label: 'Align Center',
        hotkey: 'ctrl+shift+c',
        run: () => applyToTexts(obj => {
            obj.set({textAlign: 'center'})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => obj.textAlign === 'center'),
    },
    {
        id: 'text:align-right',
        section: 'text',
        label: 'Align Right',
        hotkey: 'ctrl+shift+r',
        run: () => applyToTexts(obj => {
            obj.set({textAlign: 'right'})
        }),
        isEnabled: () => hasTextSelection(),
        isActive: () => everyText(obj => obj.textAlign === 'right'),
    },
]
