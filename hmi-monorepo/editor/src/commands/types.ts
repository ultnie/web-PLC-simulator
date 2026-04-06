import type { CommandRuntimeContext } from './utils'

export type OperationSectionId =
    | 'text'
    | 'align'
    | 'distribute'
    | 'resize'
    | 'grouping'
    | 'grid'
    | 'zoom'

export type CommandId =
    | 'text:bold'
    | 'text:italic'
    | 'text:underline'
    | 'text:align-left'
    | 'text:align-center'
    | 'text:align-right'
    | 'align:left'
    | 'align:center'
    | 'align:right'
    | 'align:top'
    | 'align:middle'
    | 'align:bottom'
    | 'distribute:horizontal'
    | 'distribute:vertical'
    | 'distribute:space-horizontal'
    | 'distribute:space-vertical'
    | 'resize:match-width'
    | 'resize:match-height'
    | 'resize:match-both'
    | 'grouping:group'
    | 'grouping:ungroup'
    | 'grouping:lock'
    | 'grouping:unlock'
    | 'grid:toggle'
    | 'grid:snap'
    | 'grid:guides'
    | 'zoom:in'
    | 'zoom:out'
    | 'zoom:reset'
    | 'zoom:actual'
    | 'zoom:fit'

export interface CommandDefinition {
    id: CommandId
    section: OperationSectionId
    label: string
    hotkey?: string
    description?: string
    run: (ctx: CommandRuntimeContext) => boolean | void
    isEnabled?: (ctx: CommandRuntimeContext) => boolean
    isActive?: (ctx: CommandRuntimeContext) => boolean
}

export interface SectionDefinition {
    id: OperationSectionId
    title: string
}

export const SECTIONS: SectionDefinition[] = [
    {id: 'align', title: 'Align'},
    {id: 'distribute', title: 'Distribute'},
    {id: 'resize', title: 'Resize'},
    {id: 'grouping', title: 'Grouping'},
    {id: 'grid', title: 'Grid & Guides'},
    {id: 'zoom', title: 'Zoom'},
]
