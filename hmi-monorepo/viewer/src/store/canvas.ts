import {defineStore} from 'pinia'

interface ViewportState {
    zoom: number
    offsetX: number
    offsetY: number
}

interface GridState {
    showGrid: boolean
    snapToGrid: boolean
    showGuides: boolean
    size: number
}

export const useViewerCanvasStore = defineStore('viewerCanvas', {
    state: () => ({
        view: {zoom: 1, offsetX: 0, offsetY: 0} as ViewportState,
        viewportSize: {width: 0, height: 0},
        grid: {showGrid: false, snapToGrid: false, showGuides: false, size: 20} as GridState,
    }),
    actions: {
        setViewportTransform(t: ViewportState) {
            this.view = {...t}
        },
        setViewportSize(width: number, height: number) {
            this.viewportSize = {width, height}
        },
        toggleGrid() {
            this.grid.showGrid = !this.grid.showGrid
        },
        toggleSnap() {
            this.grid.snapToGrid = !this.grid.snapToGrid
        },
        toggleGuides() {
            this.grid.showGuides = !this.grid.showGuides
        },
        setGridState(state: Partial<GridState>) {
            this.grid = {...this.grid, ...state}
        },
    },
})
