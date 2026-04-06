import 'fabric'

declare module 'fabric' {
    interface Object {
        id?: string
        elementType?: string
        customProps?: Record<string, any>
        bindings?: {
            inputs: Record<string, string>
            outputs: Record<string, string>
        }
        meta?: { inputs: string[]; outputs: string[] }
        updateFromProps?: () => void
    }
}
