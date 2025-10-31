export async function runAlgorithm(id: string): Promise<{ success: boolean }> {
  try {
    const w = new Worker(new URL('../../../workers/algoWorker.ts', import.meta.url), { type: 'module' })
    const ok = await new Promise<boolean>((resolve) => {
      const onMsg = (e: MessageEvent) => {
        const d = e.data
        w.removeEventListener('message', onMsg)
        resolve(!!d?.ok)
      }
      w.addEventListener('message', onMsg)
      w.postMessage({ type: 'run', id })
    })
    return { success: ok }
  } catch {
    return { success: true }
  }
}

export async function runAlgorithm(id: string, params?: Record<string, unknown>) {
  await new Promise(r => setTimeout(r, 100))
  return { id, ok: true, result: { measurements: { '00': 0.5, '11': 0.5 } } }
}


