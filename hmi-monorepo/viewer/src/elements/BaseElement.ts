import { fabric } from 'fabric'

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

    constructor(
        canvas: fabric.Canvas,
        x: number,
        y: number,
        children: fabric.Object[] = [],
        props: TProps
    ) {
        const label = new fabric.Text('name', {
            fontSize: 14,
            fill: '#000',
            originX: 'center',
            originY: 'top',
            left: 0,
            top: (children[0]?.height ?? 0) / 2 + 5 
        })

        const bindIndicator = new fabric.Circle({
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

        const allChildren = [...children, label, bindIndicator]

        super(allChildren, { 
            left: x, 
            top: y,
            selectable: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            evented: true
        })

        this.id = this.id ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? (Math.random() * 16 | 0) : (Math.random() * 4 | 8)).toString(16))
        this.customProps = props
        this.label = label
        this.bindIndicator = bindIndicator

        ;(this as any).elementType = (this.constructor as any).elementType
        ;(this as any).meta = (this.constructor as any).meta

        this.hoverCursor = 'default'

        this.lockScalingX = true
        this.lockScalingY = true
        this.lockRotation = true

        this.setControlsVisibility({
            tl: false, tr: false, bl: false, br: false,
            ml: false, mr: false, mt: false, mb: false,
            mtr: false
        })

        canvas.add(this)
        
        setTimeout(() => {
            this.updateIndicatorPosition()
            this.checkBindings()
        }, 0)
    }

    get bindings(): SavedBindings {
        return this._bindings
    }
    
    set bindings(value: SavedBindings) {
        this._bindings = {
            inputs: { ...value.inputs },
            outputs: { ...value.outputs }
        }
        this.checkBindings()
        this.canvas?.requestRenderAll()
    }

    protected checkBindings() {
        if (!this.bindIndicator) return
        
        const hasInputBindings = this._bindings?.inputs && 
            Object.values(this._bindings.inputs).some(v => v && v.trim() !== '')
        
        const hasOutputBindings = this._bindings?.outputs && 
            Object.values(this._bindings.outputs).some(v => v && v.trim() !== '')
        
        const hasAnyBindings = hasInputBindings || hasOutputBindings
        
        this.bindIndicator.set('visible', hasAnyBindings)
        this.canvas?.requestRenderAll()
    }

    setState(_: Record<string, any>): void {}

    protected get isRuntime(): boolean {
        return true
    }
    
    protected updateIndicatorPosition() {
        if (!this.bindIndicator) return
        
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
}