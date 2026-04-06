import {fabric} from 'fabric'
import type {CommandDefinition} from './types'
import {getRuntimeContext, withCanvas} from './utils'
import {DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM, fitRectToViewport, zoomToPointTransform} from '../utils/zoom'

const ZOOM_STEP = 1.2

function currentTransform(canvas: fabric.Canvas) {
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    return {
        zoom: canvas.getZoom() || 1,
        offsetX: vpt[4] || 0,
        offsetY: vpt[5] || 0,
    }
}

function applyTransform(canvas: fabric.Canvas, transform: {zoom: number; offsetX: number; offsetY: number}) {
    canvas.setViewportTransform([transform.zoom, 0, 0, transform.zoom, transform.offsetX, transform.offsetY])
    canvas.requestRenderAll()
    getRuntimeContext().store.setViewportTransform({
        zoom: transform.zoom,
        offsetX: transform.offsetX,
        offsetY: transform.offsetY,
    })
}

function zoomByFactor(factor: number) {
    return withCanvas(canvas => {
        const {store} = getRuntimeContext()
        const transform = currentTransform(canvas)
        const width = store.viewportSize.width || canvas.getWidth()
        const height = store.viewportSize.height || canvas.getHeight()
        const point = new fabric.Point(width / 2, height / 2)
        const next = zoomToPointTransform(transform, point, transform.zoom * factor)
        canvas.zoomToPoint(point, next.zoom)
        applyTransform(canvas, next)
        return true
    })
}

function setExactZoom(value: number) {
    return withCanvas(canvas => {
        const {store} = getRuntimeContext()
        const transform = currentTransform(canvas)
        const width = store.viewportSize.width || canvas.getWidth()
        const height = store.viewportSize.height || canvas.getHeight()
        const point = new fabric.Point(width / 2, height / 2)
        const next = zoomToPointTransform(transform, point, value)
        canvas.zoomToPoint(point, next.zoom)
        applyTransform(canvas, next)
        return true
    })
}

function resetView() {
    return withCanvas(canvas => {
        applyTransform(canvas, {zoom: 1, offsetX: 0, offsetY: 0})
        return true
    })
}

function fitToScreen() {
    return withCanvas(canvas => {
        const {store} = getRuntimeContext()
        const objects = canvas.getObjects().filter(obj => obj.visible)
        if (!objects.length) {
            applyTransform(canvas, {zoom: 1, offsetX: 0, offsetY: 0})
            return true
        }
        const bounds = objects.reduce((acc, obj) => {
            const rect = obj.getBoundingRect(true, true)
            const right = rect.left + rect.width
            const bottom = rect.top + rect.height
            return {
                left: Math.min(acc.left, rect.left),
                top: Math.min(acc.top, rect.top),
                right: Math.max(acc.right, right),
                bottom: Math.max(acc.bottom, bottom),
            }
        }, {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity})

        const rect = {
            left: bounds.left,
            top: bounds.top,
            width: Math.max(bounds.right - bounds.left, 1),
            height: Math.max(bounds.bottom - bounds.top, 1),
        }
        const viewport = {
            width: store.viewportSize.width || canvas.getWidth(),
            height: store.viewportSize.height || canvas.getHeight(),
        }
        const next = fitRectToViewport(rect, viewport, 40, {min: DEFAULT_MIN_ZOOM, max: DEFAULT_MAX_ZOOM})
        applyTransform(canvas, next)
        return true
    })
}

export const zoomCommands: CommandDefinition[] = [
    {
        id: 'zoom:in',
        section: 'zoom',
        label: 'Zoom In',
        hotkey: 'ctrl+=',
        run: () => zoomByFactor(ZOOM_STEP),
    },
    {
        id: 'zoom:out',
        section: 'zoom',
        label: 'Zoom Out',
        hotkey: 'ctrl+-',
        run: () => zoomByFactor(1 / ZOOM_STEP),
    },
    {
        id: 'zoom:reset',
        section: 'zoom',
        label: 'Reset View',
        hotkey: 'ctrl+0',
        run: () => resetView(),
        isActive: () => {
            const {store} = getRuntimeContext()
            return Math.abs(store.view.zoom - 1) < 0.01 && Math.abs(store.view.offsetX) < 1 && Math.abs(store.view.offsetY) < 1
        },
    },
    {
        id: 'zoom:actual',
        section: 'zoom',
        label: 'Actual Size',
        hotkey: 'ctrl+1',
        run: () => setExactZoom(1),
        isActive: () => Math.abs(getRuntimeContext().store.view.zoom - 1) < 0.01,
    },
    {
        id: 'zoom:fit',
        section: 'zoom',
        label: 'Fit to Screen',
        hotkey: 'ctrl+shift+f',
        run: () => fitToScreen(),
    },
]
