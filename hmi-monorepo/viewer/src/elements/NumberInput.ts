import { fabric } from 'fabric'
import { BaseElement } from './BaseElement'

interface NumInputProps {
  value: number
  fontSize: number
  label: string
  labelFontSize: number
  fontFamily?: string
  fontWeight?: string
}

export class NumberInput extends BaseElement<NumInputProps> {
  static elementType = 'numInput'
  static category = 'controls'
  static meta = { inputs: [] as string[], outputs: ['value'] as string[] }

  private txt: fabric.Text
  private border: fabric.Rect

  constructor(
    canvas: fabric.Canvas,
    x: number,
    y: number,
    props: Partial<NumInputProps> = {}
  ) {
    const defaults: NumInputProps = {
      value: 0,
      fontSize: 24,
      label: 'Number Input',
      labelFontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal'
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

    const text = new fabric.Text(String(p.value), {
      fontSize: p.fontSize,
      fill: '#000',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      textAlign: 'center',
      fontFamily: p.fontFamily,
      fontWeight: p.fontWeight
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

    this.on('mouseup', (e) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      this.canvas?.fire('element:edit-number', { target: this })
    })
  }

  getInputRect(): { width: number; height: number; offsetX: number; offsetY: number } {
    return {
      width: this.border.width ?? 120,
      height: this.border.height ?? 40,
      offsetX: this.border.left ?? 0,
      offsetY: this.border.top ?? 0,
    }
  }

  commitValue(raw: string) {
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    this.customProps.value = n
    this.updateFromProps()
    this.emitState()
  }

  setEditing(active: boolean) {
    this.border.set('stroke', active ? '#3b82f6' : '#ccc')
    this.txt.set('fill', active ? '#3b82f6' : '#000')
    this.canvas?.requestRenderAll()
  }

  updateFromProps() {
    this.txt.set({
      text: String(this.customProps.value),
      fontSize: this.customProps.fontSize,
      fontFamily: this.customProps.fontFamily || 'Arial, sans-serif',
      fontWeight: this.customProps.fontWeight || 'normal'
    })

    this.label.set({
      text: this.customProps.label,
      fontSize: this.customProps.labelFontSize
    })

    this.canvas?.requestRenderAll()
  }

  private emitState() {
    this.canvas?.fire('element:output', {
      target: this,
      name: 'value',
      value: this.customProps.value
    })
  }
}
