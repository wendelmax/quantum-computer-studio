function isDev(): boolean {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true
}

export function setItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (isDev()) console.warn('[safeStorage] setItem failed', key, e)
    return false
  }
}

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    if (isDev()) console.warn('[safeStorage] getItem failed', key, e)
    return null
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    if (isDev()) console.warn('[safeStorage] removeItem failed', key, e)
  }
}

export function parseJSON<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (e) {
    if (isDev()) console.warn('[safeStorage] parseJSON failed', e)
    return fallback
  }
}
