import { fabric } from 'fabric'
import { BaseElement } from './BaseElement'

interface ToggleProps {
    label: string
    labelFontSize: number
    fontFamily?: string
    fontWeight?: string
}

export class ToggleButton extends BaseElement<ToggleProps> {
    static elementType = 'toggle'
    static category = 'boolean'
    static subcategory = 'controls'

    static meta = { inputs: [], outputs: ['state'] } as const

    private background: fabric.Rect
    private slider: fabric.Rect
    private _state = false
    private lastClickTime = 0

    constructor(canvas: fabric.Canvas, x: number, y: number) {
        const props: ToggleProps = { 
            label: 'Slide Switch',
            labelFontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal'
        }

        const background = new fabric.Rect({
            width: 60,
            height: 30,
            rx: 15,
            ry: 15,
            fill: '#d1d5db',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: true 
        })

        const slider = new fabric.Rect({
            width: 26,
            height: 26,
            rx: 13,
            ry: 13,
            fill: '#fff',
            left: -15,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: true   
        })

        super(canvas, x, y, [background, slider], props)

        this.forEachObject(obj => {
            obj.set('evented', true)
            obj.set('selectable', false)
            obj.set('hoverCursor', 'pointer')
        })

        this.background = background
        this.slider = slider

        this.label.set({
            text: props.label,
            fontSize: props.labelFontSize,
            fontFamily: props.fontFamily,
            fontWeight: props.fontWeight
        })

        this.on('mouseup', (e) => {
            if (!this.isRuntime) return
            
            e.e.preventDefault()
            e.e.stopPropagation()
            
            const now = Date.now()
            if (now - this.lastClickTime < 250) {
                return
            }
            this.lastClickTime = now
            this.toggleState()
        })


        this.updateVisuals()
    }

    public toggleState() {
        this._state = !this._state
        this.updateVisuals()
        this.emitState()
    }

    public getState(): boolean {
        return this._state
    }

    private updateVisuals() {
        const targetX = this._state ? 12 : -12
        const bgColor = this._state ? '#3b82f6' : '#d1d5db'

        this.label.set({
            text: this.customProps.label,
            fontSize: this.customProps.labelFontSize,
            fontFamily: this.customProps.fontFamily || 'Arial, sans-serif',
            fontWeight: this.customProps.fontWeight || 'normal'
        })

        this.background.set({
            fill: bgColor,
            dirty: true
        })

        this.slider.animate('left', targetX, {
            duration: 150,
            onChange: () => this.canvas?.requestRenderAll(),
        })

        this.canvas?.requestRenderAll()
    }

    private emitState() {
        this.canvas?.fire('element:output', {
            target: this,
            name: 'state',
            value: this._state
        })
    }

    updateFromProps() {
        this.updateVisuals()
    }
}