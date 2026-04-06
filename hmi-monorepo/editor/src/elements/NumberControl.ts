import { fabric } from 'fabric'
import { BaseElement, type ElementMeta } from './BaseElement'

interface NumControlProps {
  value: number
  step: number
  fontSize: number
  label: string
  labelFontSize: number
  fontFamily?: string
  fontWeight?: string
}

export class NumberControl extends BaseElement<NumControlProps> {
  static elementType = 'numControl'
  static category = 'numeric'
  static subcategory = 'controls'
  static meta = { inputs: [], outputs: ['value'] } satisfies ElementMeta

  private readonly centerW = 80
  private readonly elHeight = 40

  private txt: fabric.Text
  private border: fabric.Rect
  private btnLeft: fabric.Rect
  private btnRight: fabric.Rect

  private lastClickTime = 0

  constructor(
    canvas: fabric.Canvas,
    x: number,
    y: number,
    props: Partial<NumControlProps> = {}
  ) {
    const defaults: NumControlProps = {
      value: 0,
      step: 1,
      fontSize: 18,
      label: 'Number Control',
      labelFontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal'
    }
    const p = { ...defaults, ...props }

    const btnW = 28
    const centerW = 80
    const height = 40

    // left arrow button
    const btnLeft = new fabric.Rect({
      width: btnW,
      height,
      fill: '#e5e7eb',
      stroke: '#ccc',
      strokeWidth: 1,
      rx: 4,
      ry: 4,
      originX: 'center',
      originY: 'center',
      left: -(centerW / 2 + btnW / 2),
      top: 0
    })

    const arrowLeft = new fabric.Text('◀', {
      fontSize: 12,
      fill: '#374151',
      originX: 'center',
      originY: 'center',
      left: -(centerW / 2 + btnW / 2),
      top: 0,
      selectable: false,
      evented: false
    })

    // center value display
    const border = new fabric.Rect({
      width: centerW,
      height,
      fill: 'white',
      stroke: '#ccc',
      strokeWidth: 1,
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
      fontWeight: p.fontWeight,
      selectable: false,
      evented: false
    })

    // right arrow button
    const btnRight = new fabric.Rect({
      width: btnW,
      height,
      fill: '#e5e7eb',
      stroke: '#ccc',
      strokeWidth: 1,
      rx: 4,
      ry: 4,
      originX: 'center',
      originY: 'center',
      left: centerW / 2 + btnW / 2,
      top: 0
    })

    const arrowRight = new fabric.Text('▶', {
      fontSize: 12,
      fill: '#374151',
      originX: 'center',
      originY: 'center',
      left: centerW / 2 + btnW / 2,
      top: 0,
      selectable: false,
      evented: false
    })

    super(canvas, x, y, [btnLeft, arrowLeft, border, text, btnRight, arrowRight], p)

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
    this.btnLeft = btnLeft
    this.btnRight = btnRight

    this.on('mouseup', (e) => {
      if (!this.isRuntime) return

      const now = Date.now()
      if (now - this.lastClickTime < 200) return
      this.lastClickTime = now

      e.e.preventDefault()
      e.e.stopPropagation()

      const pointer = this.canvas!.getPointer(e.e)
      const groupCenter = this.getCenterPoint()
      const localX = pointer.x - groupCenter.x
      const halfCenter = centerW / 2

      if (localX < -halfCenter) {
        this.customProps.value -= this.customProps.step
        this.updateFromProps()
        this.emitState()
      } else if (localX > halfCenter) {
        this.customProps.value += this.customProps.step
        this.updateFromProps()
        this.emitState()
      } else {
        // center rect — open inline editor
        this.canvas?.fire('element:edit-number', { target: this })
      }
    })

    // visual feedback on hover
    this.on('mousemove', (e) => {
      if (!this.isRuntime) return
      const pointer = this.canvas!.getPointer(e.e)
      const groupCenter = this.getCenterPoint()
      const localX = pointer.x - groupCenter.x
      const halfCenter = centerW / 2

      if (localX < -halfCenter) {
        this.btnLeft.set('fill', '#d1d5db')
        this.btnRight.set('fill', '#e5e7eb')
      } else if (localX > halfCenter) {
        this.btnRight.set('fill', '#d1d5db')
        this.btnLeft.set('fill', '#e5e7eb')
      } else {
        this.btnLeft.set('fill', '#e5e7eb')
        this.btnRight.set('fill', '#e5e7eb')
      }
      this.canvas?.requestRenderAll()
    })

    this.on('mouseout', () => {
      this.btnLeft.set('fill', '#e5e7eb')
      this.btnRight.set('fill', '#e5e7eb')
      this.canvas?.requestRenderAll()
    })
  }

  getInputRect(): { width: number; height: number; offsetX: number; offsetY: number } {
    return {
      width:   this.border.width  ?? this.centerW,
      height:  this.border.height ?? this.elHeight,
      offsetX: this.border.left   ?? 0,
      offsetY: this.border.top    ?? 0,
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
