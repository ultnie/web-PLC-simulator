import { fabric } from 'fabric'
import { BaseElement, type ElementMeta } from './BaseElement'

interface LedProps {
    onColor: string
    offColor: string
    label: string
    labelFontSize: number  
    fontFamily?: string
    fontWeight?: string
}

export class LedIndicator extends BaseElement<LedProps> {
    static elementType = 'led'
    static category = 'boolean'
    static subcategory = 'indicators'

    static meta = { inputs: ['value'], outputs: ['value'] } satisfies ElementMeta

    private circle: fabric.Circle
    private _state = false

    constructor(canvas: fabric.Canvas, x: number, y: number) {
        const props: LedProps = { 
            onColor: '#65d665', 
            offColor: '#d1d5db', 
            label: 'Led',
            labelFontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal'
        }

        const circle = new fabric.Circle({
            radius: 15,
            fill: props.offColor,
            strokeWidth: 1,
            originX: 'center',
            originY: 'center'
        })

        super(canvas, x, y, [circle], props)

        this.circle = circle

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
            
            this._state = !this._state
            this.updateFromProps()
            this.emitState()
        })
    }

    updateFromProps() {
        const { 
            onColor, offColor, 
            label, labelFontSize,
            fontFamily, fontWeight
        } = this.customProps

        this.circle.set('fill', this._state ? onColor : offColor)

        this.label.set({
            text: label,
            fontSize: labelFontSize,
            fontFamily: fontFamily || 'Arial, sans-serif',
            fontWeight: fontWeight || 'normal'
        })

        this.canvas?.requestRenderAll()
    }

    setState({ value }: { value?: boolean }) {
        this._state = !!value
        this.updateFromProps()
    }

    private emitState() {
        this.canvas?.fire('element:output', {
            target: this,
            name: 'value',
            value: this._state
        })
    }
}