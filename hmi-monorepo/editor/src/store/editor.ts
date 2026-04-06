import {defineStore} from 'pinia'

export type EditorMode = 'design' | 'runtime'

export const useEditorStore = defineStore('editor', {
    state: () => ({
        mode: 'design' as EditorMode
    }),
    getters: {
        isRuntime: s => s.mode === 'runtime'
    },
    actions: {
        setMode(m: EditorMode) {
            this.mode = m
        }
    }
})
