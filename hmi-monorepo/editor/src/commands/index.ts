import {textCommands} from './text'
import {alignCommands} from './align'
import {distributeCommands} from './distribute'
import {resizeCommands} from './resize'
import {groupingCommands} from './grouping'
import {gridCommands} from './grid'
import {zoomCommands} from './zoom'
import type {CommandDefinition, CommandId, OperationSectionId} from './types'
import {SECTIONS} from './types'
import {getRuntimeContext} from './utils'
import {registerHotkey} from '../utils/hotkeys'

const ALL_COMMANDS: CommandDefinition[] = [
    ...textCommands,
    ...alignCommands,
    ...distributeCommands,
    ...resizeCommands,
    ...groupingCommands,
    ...gridCommands,
    ...zoomCommands,
]

const COMMAND_MAP = new Map<CommandId, CommandDefinition>(
    ALL_COMMANDS.map(cmd => [cmd.id, cmd]),
)

export {SECTIONS}

export function listCommandsBySection(section: OperationSectionId) {
    return ALL_COMMANDS.filter(cmd => cmd.section === section)
}

export function getCommand(id: CommandId) {
    const cmd = COMMAND_MAP.get(id)
    if (!cmd) throw new Error(`Unknown command: ${id}`)
    return cmd
}

export function executeCommand(id: CommandId): boolean {
    const cmd = getCommand(id)
    const ctx = getRuntimeContext()
    if (cmd.isEnabled && !cmd.isEnabled(ctx)) {
        return false
    }
    const result = cmd.run(ctx)
    if (result === false) return false
    ctx.store.setLastCommand(cmd.section, cmd.id)
    return true
}

let hotkeysBound = false

export function initializeCommandHotkeys() {
    if (hotkeysBound) return
    hotkeysBound = true
    ALL_COMMANDS.forEach(cmd => {
        if (!cmd.hotkey) return
        registerHotkey(cmd.hotkey, event => {
            const executed = executeCommand(cmd.id)
            if (executed) {
                event.preventDefault()
            }
        })
    })
}

export function getAllCommands() {
    return ALL_COMMANDS
}
