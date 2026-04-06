export type IconName =
    | 'lucide:bold'
    | 'lucide:italic'
    | 'lucide:underline'
    | 'lucide:text-left'
    | 'lucide:text-center'
    | 'lucide:text-right'
    | 'lucide:align-left'
    | 'lucide:align-center-horizontal'
    | 'lucide:align-right'
    | 'lucide:align-top'
    | 'lucide:align-middle'
    | 'lucide:align-bottom'
    | 'lucide:distribute-horizontal'
    | 'lucide:distribute-vertical'
    | 'lucide:space-horizontal'
    | 'lucide:space-vertical'
    | 'lucide:match-width'
    | 'lucide:match-height'
    | 'lucide:match-both'
    | 'lucide:group'
    | 'lucide:ungroup'
    | 'lucide:lock'
    | 'lucide:unlock'
    | 'lucide:grid'
    | 'lucide:snap'
    | 'lucide:guides'
    | 'lucide:zoom-in'
    | 'lucide:zoom-out'
    | 'lucide:zoom-reset'
    | 'lucide:zoom-actual'
    | 'lucide:zoom-fit'

export type IconElement =
    | {type: 'line'; x1: number; y1: number; x2: number; y2: number}
    | {type: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill?: 'none' | 'currentColor'}
    | {type: 'path'; d: string; fill?: 'none' | 'currentColor'}
    | {type: 'circle'; cx: number; cy: number; r: number; fill?: 'none' | 'currentColor'}

export interface IconDefinition {
    viewBox: string
    elements: IconElement[]
    strokeWidth?: number
}

const icons: Record<IconName, IconDefinition> = {
    'lucide:bold': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 6, y: 4, width: 4, height: 16, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 11, y: 6, width: 6, height: 5, rx: 2, fill: 'currentColor'},
            {type: 'rect', x: 11, y: 13, width: 6, height: 5, rx: 2, fill: 'currentColor'},
        ],
    },
    'lucide:italic': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 10, y1: 4, x2: 16, y2: 4},
            {type: 'line', x1: 8, y1: 20, x2: 14, y2: 20},
            {type: 'line', x1: 14, y1: 4, x2: 10, y2: 20},
        ],
    },
    'lucide:underline': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 7, y1: 4, x2: 7, y2: 13},
            {type: 'line', x1: 17, y1: 4, x2: 17, y2: 13},
            {type: 'line', x1: 7, y1: 13, x2: 17, y2: 13},
            {type: 'line', x1: 5, y1: 18, x2: 19, y2: 18},
        ],
    },
    'lucide:text-left': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 4, y1: 6, x2: 18, y2: 6},
            {type: 'line', x1: 4, y1: 11, x2: 14, y2: 11},
            {type: 'line', x1: 4, y1: 16, x2: 18, y2: 16},
        ],
    },
    'lucide:text-center': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 6, y1: 6, x2: 18, y2: 6},
            {type: 'line', x1: 8, y1: 11, x2: 16, y2: 11},
            {type: 'line', x1: 5, y1: 16, x2: 19, y2: 16},
        ],
    },
    'lucide:text-right': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 6, y1: 6, x2: 20, y2: 6},
            {type: 'line', x1: 10, y1: 11, x2: 20, y2: 11},
            {type: 'line', x1: 6, y1: 16, x2: 20, y2: 16},
        ],
    },
    'lucide:align-left': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 6, y1: 4, x2: 6, y2: 20},
            {type: 'rect', x: 6, y: 6, width: 12, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 6, y: 11, width: 16, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 6, y: 16, width: 10, height: 2, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:align-center-horizontal': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 12, y1: 4, x2: 12, y2: 20},
            {type: 'rect', x: 6, y: 6, width: 12, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 4, y: 11, width: 16, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 8, y: 16, width: 8, height: 2, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:align-right': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 18, y1: 4, x2: 18, y2: 20},
            {type: 'rect', x: 6, y: 6, width: 12, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 2, y: 11, width: 16, height: 2, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 8, y: 16, width: 10, height: 2, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:align-top': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 4, y1: 6, x2: 20, y2: 6},
            {type: 'rect', x: 6, y: 6, width: 2, height: 12, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 11, y: 6, width: 2, height: 16, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 16, y: 6, width: 2, height: 8, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:align-middle': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 4, y1: 12, x2: 20, y2: 12},
            {type: 'rect', x: 6, y: 6, width: 2, height: 12, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 11, y: 4, width: 2, height: 16, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 16, y: 8, width: 2, height: 12, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:align-bottom': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 4, y1: 18, x2: 20, y2: 18},
            {type: 'rect', x: 6, y: 6, width: 2, height: 12, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 11, y: 4, width: 2, height: 14, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 16, y: 10, width: 2, height: 8, rx: 1, fill: 'currentColor'},
        ],
    },
    'lucide:distribute-horizontal': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 5, y: 6, width: 4, height: 12, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 15, y: 6, width: 4, height: 12, rx: 1, fill: 'currentColor'},
            {type: 'line', x1: 9, y1: 12, x2: 15, y2: 12},
        ],
    },
    'lucide:distribute-vertical': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 6, y: 5, width: 12, height: 4, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 6, y: 15, width: 12, height: 4, rx: 1, fill: 'currentColor'},
            {type: 'line', x1: 12, y1: 9, x2: 12, y2: 15},
        ],
    },
    'lucide:space-horizontal': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 4, y: 8, width: 3, height: 8, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 17, y: 8, width: 3, height: 8, rx: 1, fill: 'currentColor'},
            {type: 'line', x1: 7, y1: 12, x2: 10, y2: 12},
            {type: 'line', x1: 14, y1: 12, x2: 17, y2: 12},
            {type: 'line', x1: 10, y1: 12, x2: 14, y2: 12},
        ],
    },
    'lucide:space-vertical': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 8, y: 4, width: 8, height: 3, rx: 1, fill: 'currentColor'},
            {type: 'rect', x: 8, y: 17, width: 8, height: 3, rx: 1, fill: 'currentColor'},
            {type: 'line', x1: 12, y1: 7, x2: 12, y2: 10},
            {type: 'line', x1: 12, y1: 14, x2: 12, y2: 17},
            {type: 'line', x1: 12, y1: 10, x2: 12, y2: 14},
        ],
    },
    'lucide:match-width': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 6, y: 7, width: 12, height: 10, rx: 1, fill: 'none'},
            {type: 'line', x1: 4, y1: 12, x2: 6, y2: 12},
            {type: 'line', x1: 18, y1: 12, x2: 20, y2: 12},
        ],
    },
    'lucide:match-height': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 7, y: 6, width: 10, height: 12, rx: 1, fill: 'none'},
            {type: 'line', x1: 12, y1: 4, x2: 12, y2: 6},
            {type: 'line', x1: 12, y1: 18, x2: 12, y2: 20},
        ],
    },
    'lucide:match-both': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 7, y: 7, width: 10, height: 10, rx: 2, fill: 'none'},
            {type: 'line', x1: 12, y1: 4, x2: 12, y2: 7},
            {type: 'line', x1: 12, y1: 17, x2: 12, y2: 20},
            {type: 'line', x1: 4, y1: 12, x2: 7, y2: 12},
            {type: 'line', x1: 17, y1: 12, x2: 20, y2: 12},
        ],
    },
    'lucide:group': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 6, y: 6, width: 7, height: 7, rx: 1.5, fill: 'none'},
            {type: 'rect', x: 11, y: 11, width: 7, height: 7, rx: 1.5, fill: 'none'},
        ],
    },
    'lucide:ungroup': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 5, y: 5, width: 6, height: 6, rx: 1.5, fill: 'none'},
            {type: 'rect', x: 13, y: 13, width: 6, height: 6, rx: 1.5, fill: 'none'},
            {type: 'line', x1: 11, y1: 11, x2: 13, y2: 13},
        ],
    },
    'lucide:lock': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 7, y: 11, width: 10, height: 8, rx: 2, fill: 'none'},
            {type: 'line', x1: 12, y1: 14, x2: 12, y2: 17},
            {type: 'path', d: 'M9 11V8a3 3 0 0 1 6 0v3', fill: 'none'},
        ],
    },
    'lucide:unlock': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 7, y: 11, width: 10, height: 8, rx: 2, fill: 'none'},
            {type: 'line', x1: 12, y1: 14, x2: 12, y2: 17},
            {type: 'path', d: 'M9 11V8a3 3 0 0 1 5.5-1.8', fill: 'none'},
        ],
    },
    'lucide:grid': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 4, y: 4, width: 16, height: 16, rx: 2, fill: 'none'},
            {type: 'line', x1: 4, y1: 12, x2: 20, y2: 12},
            {type: 'line', x1: 12, y1: 4, x2: 12, y2: 20},
        ],
    },
    'lucide:snap': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 5, y: 5, width: 14, height: 14, rx: 2, fill: 'none'},
            {type: 'path', d: 'M9 9h6v6H9z', fill: 'none'},
        ],
    },
    'lucide:guides': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'line', x1: 12, y1: 4, x2: 12, y2: 20},
            {type: 'line', x1: 4, y1: 12, x2: 20, y2: 12},
            {type: 'circle', cx: 12, cy: 12, r: 2.5, fill: 'none'},
        ],
    },
    'lucide:zoom-in': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'circle', cx: 11, cy: 11, r: 6, fill: 'none'},
            {type: 'line', x1: 21, y1: 21, x2: 16.5, y2: 16.5},
            {type: 'line', x1: 11, y1: 8, x2: 11, y2: 14},
            {type: 'line', x1: 8, y1: 11, x2: 14, y2: 11},
        ],
    },
    'lucide:zoom-out': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'circle', cx: 11, cy: 11, r: 6, fill: 'none'},
            {type: 'line', x1: 21, y1: 21, x2: 16.5, y2: 16.5},
            {type: 'line', x1: 8, y1: 11, x2: 14, y2: 11},
        ],
    },
    'lucide:zoom-reset': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'circle', cx: 12, cy: 12, r: 7, fill: 'none'},
            {type: 'path', d: 'M12 5v4l3-2', fill: 'none'},
        ],
    },
    'lucide:zoom-actual': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'none'},
            {type: 'line', x1: 9, y1: 9, x2: 15, y2: 15},
        ],
    },
    'lucide:zoom-fit': {
        viewBox: '0 0 24 24',
        elements: [
            {type: 'rect', x: 4, y: 4, width: 16, height: 16, rx: 2, fill: 'none'},
            {type: 'path', d: 'M9 9h6v6H9z', fill: 'none'},
        ],
    },
}

export function getIcon(name: IconName): IconDefinition {
    const icon = icons[name]
    if (!icon) {
        throw new Error(`Unknown icon: ${name}`)
    }
    return icon
}
