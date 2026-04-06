import {fabric} from 'fabric'
import type {CommandDefinition} from './types'
import {commitCanvasChange, getActiveSelection, withCanvas} from './utils'

const hasMultiple = () => withCanvas(canvas => getActiveSelection(canvas).objects.length >= 2)

const hasSelection = () => withCanvas(canvas => getActiveSelection(canvas).objects.length > 0)

export const groupingCommands: CommandDefinition[] = [
    {
        id: 'grouping:group',
        section: 'grouping',
        label: 'Group',
        hotkey: 'ctrl+g',
        run: () => withCanvas(canvas => {
            const {active} = getActiveSelection(canvas)
            if (!active || active.type !== 'activeSelection') return false
            const group = (active as fabric.ActiveSelection).toGroup()
            canvas.setActiveObject(group)
            commitCanvasChange(canvas)
            return true
        }),
        isEnabled: hasMultiple,
    },
    {
        id: 'grouping:ungroup',
        section: 'grouping',
        label: 'Ungroup',
        hotkey: 'ctrl+shift+g',
        run: () => withCanvas(canvas => {
            const active = canvas.getActiveObject()
            if (!active || active.type !== 'group') return false
            const group = active as fabric.Group
            const items = group.getObjects().slice()
            const groupMatrix = group.calcTransformMatrix()

            canvas.discardActiveObject()
            canvas.remove(group)

            items.forEach(item => {
                const localPoint = new fabric.Point(item.left ?? 0, item.top ?? 0)
                const absPoint = fabric.util.transformPoint(localPoint, groupMatrix)
                ;(item as any).group = undefined
                item.set({left: absPoint.x, top: absPoint.y})
                item.setCoords()
                canvas.add(item)
            })

            if (items.length > 1) {
                const sel = new fabric.ActiveSelection(items, {canvas})
                canvas.setActiveObject(sel)
            } else if (items.length === 1) {
                canvas.setActiveObject(items[0])
            }

            commitCanvasChange(canvas)
            return true
        }),
        isEnabled: () => withCanvas(canvas => {
            const active = canvas.getActiveObject()
            return Boolean(active && active.type === 'group')
        }),
    },
    {
        id: 'grouping:lock',
        section: 'grouping',
        label: 'Lock',
        hotkey: 'ctrl+alt+l',
        run: () => withCanvas(canvas => {
            const {objects} = getActiveSelection(canvas)
            if (!objects.length) return false
            objects.forEach(obj => {
                obj.set({
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                })
            })
            commitCanvasChange(canvas)
            return true
        }),
        isEnabled: hasSelection,
    },
    {
        id: 'grouping:unlock',
        section: 'grouping',
        label: 'Unlock',
        hotkey: 'ctrl+alt+shift+l',
        run: () => withCanvas(canvas => {
            const {objects} = getActiveSelection(canvas)
            if (!objects.length) return false
            objects.forEach(obj => {
                obj.set({
                    lockMovementX: false,
                    lockMovementY: false,
                    lockRotation: false,
                    lockScalingX: false,
                    lockScalingY: false,
                })
            })
            commitCanvasChange(canvas)
            return true
        }),
        isEnabled: hasSelection,
    },
]
