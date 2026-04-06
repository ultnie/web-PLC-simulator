// Tank.ts
import { fabric } from 'fabric'
import { BaseElement } from './BaseElement'

interface TankProps {
  width: number
  height: number
  minValue: number
  maxValue: number
  value: number
  fillColor: string
  emptyColor: string
  borderColor: string
  showValue: boolean
  valueFontSize: number
  label: string
  labelFontSize: number
  orientation: 'vertical' | 'horizontal'
}

export class Tank extends BaseElement<TankProps> {
  static elementType = 'tank'
  static category = 'numeric'
  static subcategory = 'indicators'
  static meta = { inputs: ['value'], outputs: [] } as const

  private container: fabric.Rect
  private fill: fabric.Rect
  private valueText: fabric.Text
  private currentValue: number = 0

  private padding = 6

  constructor(
    canvas: fabric.Canvas,
    x: number,
    y: number,
    props: Partial<TankProps> = {}
  ) {
    const defaults: TankProps = {
      width: 80,
      height: 150,
      minValue: 0,
      maxValue: 100,
      value: 0,
      fillColor: '#4caf50',
      emptyColor: '#f5f5f5',
      borderColor: '#333',
      showValue: true,
      valueFontSize: 12,
      label: 'Tank',
      labelFontSize: 14,
      orientation: 'vertical'
    }

    const p = { ...defaults, ...props }

    // 👇 ЛОКАЛЬНАЯ переменная (ключевой фикс)
    const padding = 6

    const container = new fabric.Rect({
      width: p.width,
      height: p.height,
      fill: p.emptyColor,
      stroke: p.borderColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0
    })

    const fillRect = new fabric.Rect({
      width: p.width - padding * 2,
      height: 0,
      fill: p.fillColor,
      originX: 'center',
      originY: 'bottom',
      left: 0,
      top: p.height / 2 - padding,
      rx: 2,
      ry: 2
    })

    const valueText = new fabric.Text('0', {
      fontSize: p.valueFontSize,
      fill: '#000',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: -p.height / 2 + 15,
      fontWeight: 'bold'
    })

    super(canvas, x, y, [container, fillRect, valueText], p)

    this.container = container
    this.fill = fillRect
    this.valueText = valueText
    this.padding = padding

    this.label.set({
      text: p.label,
      fontSize: p.labelFontSize,
      originX: 'center',
      originY: 'top',
      top: p.height / 2 + 10,
      left: 0
    })

    this.setValue(p.value)
  }

  private setValue(value: number) {
    const { minValue, maxValue, height } = this.customProps

    this.currentValue = Math.max(minValue, Math.min(maxValue, value))

    const percent =
      (this.currentValue - minValue) / (maxValue - minValue || 1)

    const maxFillHeight = height - this.padding * 2
    const fillHeight = maxFillHeight * percent

    this.fill.set({
      height: fillHeight
    })

    if (this.customProps.showValue) {
      this.valueText.set({
        text: this.currentValue.toFixed(1)
      })
    } else {
      this.valueText.set({ text: '' })
    }

    this.canvas?.requestRenderAll()
  }

  updateFromProps() {
    const p = this.customProps

    this.container.set({
      width: p.width,
      height: p.height,
      fill: p.emptyColor,
      stroke: p.borderColor
    })

    this.fill.set({
      width: p.width - this.padding * 2,
      fill: p.fillColor,
      top: p.height / 2 - this.padding
    })

    this.valueText.set({
      fontSize: p.valueFontSize,
      top: -p.height / 2 + 15
    })

    this.label.set({
      text: p.label,
      fontSize: p.labelFontSize,
      top: p.height / 2 + 10
    })

    this.updateIndicatorPosition()
    this.setValue(this.currentValue)
  }

  setState({ value }: { value?: number }) {
    if (value != null && Number.isFinite(value)) {
      this.setValue(value)
    }
  }
}