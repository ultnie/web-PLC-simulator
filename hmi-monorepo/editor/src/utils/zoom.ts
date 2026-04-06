export interface ViewportTransform {
    zoom: number
    offsetX: number
    offsetY: number
}

export interface Point {
    x: number
    y: number
}

export interface Rect {
    left: number
    top: number
    width: number
    height: number
}

export const DEFAULT_MIN_ZOOM = 0.25
export const DEFAULT_MAX_ZOOM = 4

export function clampZoom(zoom: number, min = DEFAULT_MIN_ZOOM, max = DEFAULT_MAX_ZOOM) {
    return Math.min(max, Math.max(min, zoom))
}

export function zoomToPointTransform(
    current: ViewportTransform,
    point: Point,
    newZoom: number,
): ViewportTransform {
    const nextZoom = clampZoom(newZoom)
    const safeCurrent = current.zoom === 0 ? 1 : current.zoom
    const scale = nextZoom / safeCurrent
    const offsetX = point.x - scale * (point.x - current.offsetX)
    const offsetY = point.y - scale * (point.y - current.offsetY)
    return {
        zoom: nextZoom,
        offsetX,
        offsetY,
    }
}

export function fitRectToViewport(
    content: Rect,
    viewport: {width: number; height: number},
    padding = 32,
    limits: {min?: number; max?: number} = {},
): ViewportTransform {
    const minZoom = limits.min ?? DEFAULT_MIN_ZOOM
    const maxZoom = limits.max ?? DEFAULT_MAX_ZOOM
    const effectiveWidth = Math.max(content.width, 1)
    const effectiveHeight = Math.max(content.height, 1)

    const availableWidth = Math.max(viewport.width - padding * 2, 1)
    const availableHeight = Math.max(viewport.height - padding * 2, 1)

    const zoomByWidth = availableWidth / effectiveWidth
    const zoomByHeight = availableHeight / effectiveHeight
    const zoom = clampZoom(Math.min(zoomByWidth, zoomByHeight), minZoom, maxZoom)

    const offsetX = (viewport.width - content.width * zoom) / 2 - content.left * zoom
    const offsetY = (viewport.height - content.height * zoom) / 2 - content.top * zoom

    return {zoom, offsetX, offsetY}
}
