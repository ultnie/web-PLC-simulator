export function deepMerge<T>(base:T, patch:Partial<T>):T {
    for (const [k, v] of Object.entries(patch)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            base[k as keyof T] = deepMerge( (base[k as keyof T] ?? {}) as any, v )
        } else {
            (base as any)[k] = v
        }
    }
    return base
}
