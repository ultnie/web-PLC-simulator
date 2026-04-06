import { fabric } from 'fabric'
import { useEditorStore } from '../store/editor'

export interface ElementMeta {
    inputs: string[]
    outputs: string[]
}

interface SavedBindings {
    inputs: Record<string, string>
    outputs: Record<string, string>
}

export abstract class BaseElement<TProps = Record<string, any>> extends fabric.Group {
    static elementType: string
    static category: string

    static meta: ElementMeta

    customProps!: TProps
    private _bindings: SavedBindings = { inputs: {}, outputs: {} }
    public id: any
    public label!: fabric.Text  
    
    protected bindIndicator!: fabric.Circle | null
    protected showBindIndicator: boolean = true

    constructor(
        canvas: fabric.Canvas,
        x: number,
        y: number,
        children: fabric.Object[] = [],
        props: TProps,
        options?: { showBindIndicator?: boolean }
    ) {
        const label = new fabric.Text(' ', {
            fontSize: 14,
            fill: '#000',
            originX: 'center',
            originY: 'top',
            left: 0,
            top: (children[0]?.height ?? 0) / 2 + 5 
        })

        let bindIndicator: fabric.Circle | null = null
        const showIndicator = options?.showBindIndicator !== false
        
        if (showIndicator) {
            bindIndicator = new fabric.Circle({
                radius: 6,
                fill: '#019610',
                stroke: '#ffffff',
                strokeWidth: 1,
                originX: 'right',
                originY: 'center',
                left: (children[0]?.width ?? 60) / 2,
                top: -(children[0]?.height ?? 30) / 2,
                selectable: false,
                evented: false,
                visible: false,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 3,
                    offsetX: 1,
                    offsetY: 1
                })
            })
        }

        const allChildren = [...children, label]
        if (bindIndicator) {
            allChildren.push(bindIndicator)
        }

        super(allChildren, { left: x, top: y })

        this.id = this.id ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? (Math.random() * 16 | 0) : (Math.random() * 4 | 8)).toString(16))
        this.customProps = props
        this.label = label
        this.bindIndicator = bindIndicator
        this.showBindIndicator = showIndicator

        ;(this as any).elementType = (this.constructor as any).elementType
        ;(this as any).meta = (this.constructor as any).meta

        this.hoverCursor = 'pointer'
        this.setControlsVisibility({
            tl: true, tr: true, bl: true, br: true,
            ml: false, mr: false, mt: false, mb: false,
            mtr: false
        })
        this.lockScalingX = true
        this.lockScalingY = true
        this.lockRotation = true
        this.set({ hasControls: false, selectable: true })

        this.on('mousedblclick', () => {
            this.set({
                hasControls: true,
                lockScalingX: false,
                lockScalingY: false,
                lockRotation: false
            })
            this.canvas?.requestRenderAll()
        })

        this.on('deselected', () => {
            this.set({
                hasControls: false,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
            })
            this.canvas?.requestRenderAll()
        })

        canvas.add(this)
        
        if (this.bindIndicator) {
            setTimeout(() => {
                this.updateIndicatorPosition()
                this.checkBindings()
            }, 0)
        }
    }

    setBindings(bindings: SavedBindings) {
        this._bindings = {
            inputs: { ...bindings.inputs },
            outputs: { ...bindings.outputs }
        }
        
        this.set('bindingsData', this._bindings)
        
        this.checkBindings()
        
        this.canvas?.requestRenderAll()
    }

    getBindings(): SavedBindings {
        return this._bindings
    }

    get bindings(): SavedBindings {
        return this._bindings
    }
    
    set bindings(value: SavedBindings) {
        this.setBindings(value)
    }

    protected checkBindings() {
        if (!this.bindIndicator || !this.showBindIndicator) return
        
        const hasInputBindings = this._bindings?.inputs && 
            Object.values(this._bindings.inputs).some(v => v && v.trim() !== '')
        
        const hasOutputBindings = this._bindings?.outputs && 
            Object.values(this._bindings.outputs).some(v => v && v.trim() !== '')
        
        const hasAnyBindings = hasInputBindings || hasOutputBindings
        
        if (this.bindIndicator) {
            this.bindIndicator.set('visible', hasAnyBindings)
            this.canvas?.requestRenderAll()
        }
    }

    setState(_: Record<string, any>): void {}

    protected get isRuntime() {
        return useEditorStore().isRuntime
    }
    
    protected updateIndicatorPosition() {
        if (!this.bindIndicator || !this.showBindIndicator) return
        
        const mainChild = this.getObjects().find(obj => obj !== this.label && obj !== this.bindIndicator)
        
        if (mainChild) {
            const width = mainChild.getScaledWidth ? mainChild.getScaledWidth() : (mainChild.width || 60)
            const height = mainChild.getScaledHeight ? mainChild.getScaledHeight() : (mainChild.height || 30)
            
            this.bindIndicator.set({
                left: width / 2,
                top: -height / 2
            })
            this.bindIndicator.setCoords()
        }
    }
    
    setDimensions(width: number, height: number): void {
        super.setDimensions(width, height)
        this.updateIndicatorPosition()
    }
    
    toObject(propertiesToInclude: string[] = []): any {
        return super.toObject(propertiesToInclude.concat(['bindingsData', 'elementType', 'meta', 'customProps']))
    }
    
    fromObject(object: any, callback?: Function) {
        super.fromObject(object, () => {
            if (object.bindingsData) {
                this.setBindings(object.bindingsData)
            }
            if (callback) callback()
        })
    }
    
    onRender() {
        if (this.bindIndicator) {
            this.updateIndicatorPosition()
            this.checkBindings()
        }
    }
}