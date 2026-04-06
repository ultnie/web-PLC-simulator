import {fabric} from 'fabric'
import {useCanvas} from '../composables/useCanvas'
import {useCanvasStore} from '../store/canvas'

export interface CommandRuntimeContext {
    canvas: fabric.Canvas | null
    store: ReturnType<typeof useCanvasStore>
}

export function getRuntimeContext(): CommandRuntimeContext {
    const {canvas} = useCanvas()
    return {canvas: canvas.value, store: useCanvasStore()}
}

export function commitCanvasChange(canvas: fabric.Canvas) {
    canvas.fire('object:modified', {target: canvas.getActiveObject() ?? undefined})
    canvas.requestRenderAll()
}

export function getActiveSelection(canvas: fabric.Canvas) {
    const active = canvas.getActiveObject()
    if (!active) return {objects: [], active: null}

    if (active.type === 'activeSelection') {
        const sel = active as fabric.ActiveSelection
        return {objects: sel.getObjects(), active: sel}
    }

    return {objects: [active], active}
}

export function isTextObject(obj: fabric.Object): obj is fabric.Textbox | fabric.IText | fabric.Text {
    return obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text'
}

export function getBoundingRect(obj: fabric.Object) {
    return obj.getBoundingRect(true, true)
}

export function withCanvas(callback: (canvas: fabric.Canvas) => boolean | void): boolean {
    const {canvas} = useCanvas()
    const instance = canvas.value
    if (!instance) return false
    const result = callback(instance)
    return result === false ? false : true
}
