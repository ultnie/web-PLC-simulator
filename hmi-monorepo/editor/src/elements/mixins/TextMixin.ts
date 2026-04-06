import { fabric } from 'fabric'

export interface TextProps {
    label: string
    fontSize: number
    fontFamily?: string
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textAlign?: 'left' | 'center' | 'right'
    fill?: string
}

export const DEFAULT_TEXT_PROPS: Required<TextProps> = {
    label: 'Label',
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    fill: '#000000',
}

/**
 * Создаёт fabric.Text с заданными текстовыми свойствами
 */
export function createTextElement(props: Partial<TextProps> = {}): fabric.Text {
    const p = { ...DEFAULT_TEXT_PROPS, ...props }
    return new fabric.Text(p.label, {
        fontSize: p.fontSize,
        fontFamily: p.fontFamily,
        fontWeight: p.fontWeight,
        fontStyle: p.fontStyle,
        textAlign: p.textAlign,
        fill: p.fill,
        originX: 'left',
        originY: 'top',
    })
}

/**
 * Обновляет существующий fabric.Text согласно текстовым свойствам
 */
export function updateTextElement(textElement: fabric.Text, props: Partial<TextProps>): void {
    const updates: any = {}

    if (props.label !== undefined) updates.text = props.label
    if (props.fontSize !== undefined) updates.fontSize = props.fontSize
    if (props.fontFamily !== undefined) updates.fontFamily = props.fontFamily
    if (props.fontWeight !== undefined) updates.fontWeight = props.fontWeight
    if (props.fontStyle !== undefined) updates.fontStyle = props.fontStyle
    if (props.textAlign !== undefined) updates.textAlign = props.textAlign
    if (props.fill !== undefined) updates.fill = props.fill

    textElement.set(updates)
}

/**
 * Извлекает текстовые свойства из fabric.Text
 */
export function extractTextProps(textElement: fabric.Text): TextProps {
    return {
        label: textElement.text ?? '',
        fontSize: textElement.fontSize ?? DEFAULT_TEXT_PROPS.fontSize,
        fontFamily: textElement.fontFamily ?? DEFAULT_TEXT_PROPS.fontFamily,
        fontWeight: (textElement.fontWeight as any) ?? DEFAULT_TEXT_PROPS.fontWeight,
        fontStyle: textElement.fontStyle ?? DEFAULT_TEXT_PROPS.fontStyle,
        textAlign: textElement.textAlign ?? DEFAULT_TEXT_PROPS.textAlign,
        fill: textElement.fill?.toString() ?? DEFAULT_TEXT_PROPS.fill,
    }
}
