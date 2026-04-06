export type HotkeyHandler = (event: KeyboardEvent) => void

const handlers = new Map<string, HotkeyHandler[]>()
let listenerAttached = false

const SPECIAL_KEYS: Record<string, string> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    ' ': 'space',
    Escape: 'escape',
    Enter: 'enter',
    '+': '+',
}

function normalizeKey(key: string) {
    if (SPECIAL_KEYS[key]) return SPECIAL_KEYS[key]
    return key.length === 1 ? key.toLowerCase() : key.toLowerCase()
}

function normalizeCombo(combo: string) {
    const parts = combo
        .split('+')
        .map(part => part.trim().toLowerCase())
        .filter(Boolean)
    const modifiers = parts.filter(p => ['ctrl', 'alt', 'shift', 'meta'].includes(p))
    const keys = parts.filter(p => !['ctrl', 'alt', 'shift', 'meta'].includes(p))
    const key = keys.pop() ?? ''
    const finalModifiers = modifiers.filter((value, index) => modifiers.indexOf(value) === index)
    finalModifiers.sort((a, b) => {
        const order = ['ctrl', 'meta', 'alt', 'shift']
        return order.indexOf(a) - order.indexOf(b)
    })
    if (!key) return finalModifiers.join('+')
    return [...finalModifiers, key].join('+')
}

function eventToCombo(event: KeyboardEvent) {
    const mods: string[] = []
    if (event.ctrlKey || event.metaKey) mods.push('ctrl')
    if (event.altKey) mods.push('alt')
    if (event.shiftKey) mods.push('shift')
    const key = normalizeKey(event.key)
    return normalizeCombo([...mods, key].join('+'))
}

function ensureListener() {
    if (listenerAttached) return
    listenerAttached = true
    window.addEventListener('keydown', (evt: KeyboardEvent) => {
        const combo = eventToCombo(evt)
        const list = handlers.get(combo)
        if (!list || list.length === 0) return
        list.forEach(handler => handler(evt))
    })
}

export function registerHotkey(combo: string, handler: HotkeyHandler) {
    const normalized = normalizeCombo(combo)
    const list = handlers.get(normalized) ?? []
    list.push(handler)
    handlers.set(normalized, list)
    ensureListener()
}
