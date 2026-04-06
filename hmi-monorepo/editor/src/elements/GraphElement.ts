import { fabric } from 'fabric'
import { BaseElement, type ElementMeta } from './BaseElement'

export interface GraphProps {
  label: string
  labelFontSize: number
  yMax: number
  yStep: number
  timeStep: number
  timePoints: number
  width: number
  height: number
}

export class GraphElement extends BaseElement<GraphProps> {
  static elementType = 'time-graph'
  static category = 'graph'
  static meta = { inputs: ['value'], outputs: [] } satisfies ElementMeta

  private _currentValue = 0

  constructor(canvas: fabric.Canvas, x: number, y: number, props: Partial<GraphProps> = {}) {
    const defaults: GraphProps = {
      label: 'Graph',
      labelFontSize: 14,
      yMax: 100,
      yStep: 20,
      timeStep: 1,
      timePoints: 20,
      width: 300,
      height: 200,
    }
    const p = { ...defaults, ...props }

    const rect = new fabric.Rect({
      width: p.width,
      height: p.height,
      fill: '#0f172a',
      stroke: '#888',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
    })

    const text = new fabric.Text('Graph', {
      fontSize: 16,
      fill: '#94a3b8',
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    })

    super(canvas, x, y, [rect, text], p)

    this.label.set({
      text: p.label,
      fontSize: p.labelFontSize,
      originX: 'center',
      originY: 'top',
      top: p.height / 2 + 20,
      left: 0,
    })
  }

  setState(state: Record<string, any>) {
    if ('value' in state && state.value !== undefined) {
      this._currentValue = Number(state.value)
    }
  }

  getCurrentValue(): number {
    return this._currentValue
  }

  updateFromProps() {
    this.label.set({
      text: this.customProps.label,
      fontSize: this.customProps.labelFontSize,
    })
    this.canvas?.requestRenderAll()
  }
}
