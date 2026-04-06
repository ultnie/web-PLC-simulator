import {defineStore} from 'pinia'
import type {fabric} from 'fabric'
import type {CommandId, OperationSectionId} from '../commands/types'

const OPERATIONS_STORAGE_KEY = 'editor.operations.sidebar'

interface ViewportState {
    zoom: number
    offsetX: number
    offsetY: number
}

interface OperationsState {
    openSections: OperationSectionId[]
    lastCommand: Partial<Record<OperationSectionId, CommandId>>
}

interface GridState {
    showGrid: boolean
    snapToGrid: boolean
    showGuides: boolean
    size: number
}

interface SelectionState {
    count: number
    hasText: boolean
    hasMultiple: boolean
    activeType: string | null
    selectedObject: fabric.Object | null
}

const DEFAULT_SECTIONS: OperationSectionId[] = ['text', 'align', 'distribute', 'resize', 'grouping', 'grid', 'zoom']

function loadOperationsState(): OperationsState {
    if (typeof window === 'undefined') {
        return {openSections: [...DEFAULT_SECTIONS], lastCommand: {}}
    }
    try {
        const raw = window.localStorage.getItem(OPERATIONS_STORAGE_KEY)
        if (!raw) return {openSections: [...DEFAULT_SECTIONS], lastCommand: {}}
        const parsed = JSON.parse(raw) as OperationsState
        if (!Array.isArray(parsed.openSections)) {
            parsed.openSections = [...DEFAULT_SECTIONS]
        }
        return parsed
    } catch {
        return {openSections: [...DEFAULT_SECTIONS], lastCommand: {}}
    }
}

function persistOperationsState(state: OperationsState) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(OPERATIONS_STORAGE_KEY, JSON.stringify(state))
}

const defaultView: ViewportState = {zoom: 1, offsetX: 0, offsetY: 0}

export const useCanvasStore = defineStore('canvas', {
    state: () => ({
        view: {...defaultView} as ViewportState,
        viewportSize: {width: 0, height: 0},
        selection: {count: 0, hasText: false, hasMultiple: false, activeType: null, selectedObject: null} as SelectionState,
        operations: loadOperationsState(),
        grid: {showGrid: false, snapToGrid: false, showGuides: false, size: 20} as GridState,
    }),
    getters: {
        zoom: state => state.view.zoom,
    },
    actions: {
        setSelection(objs: fabric.Object[]) {
            this.selection.count = objs.length
            this.selection.hasMultiple = objs.length > 1
            this.selection.activeType = objs[0]?.type ?? null
            this.selection.selectedObject = objs[0] ?? null
            this.selection.hasText = objs.some(obj => obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text')
        },
        setView(partial: Partial<ViewportState>) {
            this.view = {...this.view, ...partial}
        },
        setViewportTransform(transform: ViewportState) {
            this.view = {...transform}
        },
        setViewportSize(width: number, height: number) {
            this.viewportSize = {width, height}
        },
        setSectionOpen(id: OperationSectionId, open: boolean) {
            const set = new Set(this.operations.openSections)
            if (open) set.add(id)
            else set.delete(id)
            this.operations.openSections = Array.from(set)
            persistOperationsState(this.operations)
        },
        toggleSection(id: OperationSectionId) {
            const isOpen = this.operations.openSections.includes(id)
            this.setSectionOpen(id, !isOpen)
        },
        setLastCommand(section: OperationSectionId, cmd: CommandId) {
            this.operations.lastCommand = {...this.operations.lastCommand, [section]: cmd}
            persistOperationsState(this.operations)
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
        serializeView() {
            return {...this.view}
        }
    }
})
