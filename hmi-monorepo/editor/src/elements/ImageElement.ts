import {fabric} from 'fabric'
import {BaseElement, type ElementMeta} from './BaseElement'

export interface ImageProps {
    src: string
}

export class ImageElement extends BaseElement<ImageProps> {
    static elementType = 'image'
    static category = 'decorations'
    static meta = {inputs: [], outputs: []} satisfies ElementMeta

    constructor(
        canvas: fabric.Canvas,
        x: number,
        y: number,
        props: ImageProps
    ) {
        super(canvas, x, y, [], props)

        fabric.Image.fromURL(
            props.src,
            (img) => {
                this.addWithUpdate(img)
                this.canvas?.requestRenderAll()
            },
            {crossOrigin: ''}
        )
    }
}
