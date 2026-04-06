export const API_ROOT =
    (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, '') || ''

export const api = (path: string) =>
    `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`
