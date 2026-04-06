import {LedIndicator} from './LedIndicator'
import {ToggleButton} from './ToggleButton'
import {ImageElement} from './ImageElement'
import {LineElement} from './LineElement'
import {NumberInput} from './NumberInput'
import {NumberControl} from './NumberControl'
import {NumberDisplay} from './NumberDisplay'
import {GraphElement} from './GraphElement'

export const ElementRegistry = {
    led: LedIndicator,
    toggle: ToggleButton,
    image: ImageElement,
    line: LineElement,
    numInput: NumberInput,
    numControl: NumberControl,
    numDisplay: NumberDisplay,
    graph: GraphElement,
} as const

export type ElementType = keyof typeof ElementRegistry
