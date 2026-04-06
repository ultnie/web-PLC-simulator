export function flattenObject(
    obj: Record<string, any>,
    prefix = '',
    delim = '.'
): Record<string, any> {
    return Object.entries(obj ?? {}).reduce<Record<string, any>>(
        (acc, [k, v]) => {
            const key = prefix ? `${prefix}${delim}${k}` : k

            if (Array.isArray(v)) {
                v.forEach((item, i) => {
                    Object.assign(
                        acc,
                        flattenObject({[i]: item}, key, delim)
                    )
                })
                return acc
            }

            if (v && typeof v === 'object') {
                Object.assign(acc, flattenObject(v, key, delim))
            } else {
                acc[key] = v
            }

            return acc
        },
        {}
    )
}
