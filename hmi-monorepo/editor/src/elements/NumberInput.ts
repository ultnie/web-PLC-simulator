import { fabric } from 'fabric'
import { BaseElement, type ElementMeta } from './BaseElement'

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
  static category = 'numeric'
  static subcategory = 'controls'
  static meta = { inputs: [], outputs: ['value'] } satisfies ElementMeta

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
      left: 0,
      fontFamily: p.fontFamily,
      fontWeight: p.fontWeight
    })

    this.txt = text
    this.border = border

    this.on('mouseup', (e) => {
      if (!this.isRuntime) return

      e.e.preventDefault()
      e.e.stopPropagation()

      // fire event — CanvasComponent will show inline editor
      this.canvas?.fire('element:edit-number', { target: this })
    })
  }

  // returns the border rect dimensions and center offset for inline editor positioning
  getInputRect(): { width: number; height: number; offsetX: number; offsetY: number } {
    return {
      width: this.border.width ?? 120,
      height: this.border.height ?? 40,
      offsetX: this.border.left ?? 0,
      offsetY: this.border.top ?? 0,
    }
  }

  // called by CanvasComponent when user confirms inline input
  commitValue(raw: string) {
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    this.customProps.value = n
    this.updateFromProps()
    this.emitState()
  }

  // highlight border while editing
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
      fontSize: this.customProps.labelFontSize,
      fontFamily: this.customProps.fontFamily || 'Arial, sans-serif',
      fontWeight: this.customProps.fontWeight || 'normal'
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
