export function getByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function buildInputPayload(fullPath: string, value: any) {
    const [root, section, ...rest] = fullPath.split('.')
    const name = rest.join('.')
    if (!name) {
        console.warn('[buildInputPayload] empty name →', fullPath)
        return {}
    }

    /*  PLC (Controller) */
    if (root === 'outputs') {
        if (section === 'inputs')
            return { inputs: { [name]: value } }
        if (section === 'global_inputs' || section === 'global_vars')
            return { global_inputs: { [name]: value } }
    }

    /*  PLANT */
    if (root === 'plant_outputs') {
        if (section === 'inputs')
            return { plant_inputs: { [name]: value } }
        if (section === 'global_inputs' || section === 'global_vars')
            return { plant_inputs: { [name]: value } }
    }

    console.warn('[buildInputPayload] unsupported path →', fullPath)
    return {}
}

export function resolveStorePath(
    ss: ReturnType<typeof useSessionStore>,
    fullPath: string
) {
    if (!fullPath.includes('.')) fullPath = `outputs.${fullPath}`

    const [dataset, ...rest] = fullPath.split('.')

    const root =
        dataset === 'plant_outputs'
            ? ss.plant
            : ss.plc

    return getByPath(root, rest.join('.'))
}

