import { fabric } from 'fabric'
import { BaseElement } from './BaseElement'

interface NumDisplayProps {
  fontSize: number
  precision: number
  label: string
  labelFontSize: number
}

export class NumberDisplay extends BaseElement<NumDisplayProps> {
  static elementType = 'numDisplay'
  static category = 'indicators'
  
  static meta = { inputs: ['value'], outputs: [] } as const

  private txt: fabric.Text
  private border: fabric.Rect

  constructor(
    canvas: fabric.Canvas,
    x: number,
    y: number,
    props: Partial<NumDisplayProps> = {}
  ) {
    const defaults: NumDisplayProps = {
      fontSize: 24,
      precision: 2,
      label: 'Number Display',
      labelFontSize: 14
    }
    const p = { ...defaults, ...props }

    const width = 120
    const height = 40

    const border = new fabric.Rect({
      width,
      height,
      fill: 'transparent',
      stroke: '#ccc',
      strokeWidth: 1,
      rx: 4,
      ry: 4,
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0
    })

    const text = new fabric.Text('--', {
      fontSize: p.fontSize,
      fill: '#000',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      textAlign: 'center'
    })

    super(canvas, x, y, [border, text], p)

    this.label.set({
      text: p.label,
      fontSize: p.labelFontSize,
      originX: 'center',
      originY: 'top',
      top: height / 2.2,
      left: 0
    })

    this.txt = text
    this.border = border
  }

  updateFromProps() {
    this.txt.set({
      fontSize: this.customProps.fontSize
    })

    this.label.set({
      text: this.customProps.label,
      fontSize: this.customProps.labelFontSize
    })

    this.canvas?.requestRenderAll()
  }

  setState({ value }: { value?: number }) {
    if (value == null) return

    let displayText = '--'

    if (Number.isFinite(value)) {
      displayText = Number(value).toFixed(this.customProps.precision)

      if (displayText.length > 10) {
        displayText = displayText.slice(0, 10)
      }
    }

    this.txt.set({ text: displayText })
    this.canvas?.requestRenderAll()
  }
}