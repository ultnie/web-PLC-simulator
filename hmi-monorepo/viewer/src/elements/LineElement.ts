import { fabric } from 'fabric'
import { BaseElement } from './BaseElement'

interface LineProps {
    stroke: string
    strokeWidth: number
}

export class LineElement extends BaseElement<LineProps> {
    static elementType = 'line'
    static category = 'decorations'
    static meta = { inputs: [], outputs: [] } as const

    private line: fabric.Line

    constructor(canvas: fabric.Canvas, x: number, y: number, props?: Partial<LineProps>) {
        const defaults: LineProps = { stroke: '#000000', strokeWidth: 2 }
        const p = { ...defaults, ...props }
        
        const l = new fabric.Line([0, 0, 120, 0], {
            stroke: p.stroke,
            strokeWidth: p.strokeWidth,
            strokeLineCap: 'round'
        })
        
        super(canvas, x, y, [l], p)
        
        this.label.set({
            text: '',
            visible: false
        })
        
        this.line = l
        
    }

    updateFromProps() {
        this.line.set({
            stroke: this.customProps.stroke,
            strokeWidth: this.customProps.strokeWidth
        })
        this.canvas?.requestRenderAll()
    }
}