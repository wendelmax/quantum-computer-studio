// Web Worker for offloaded simulation
import { runSimulation } from '../app/circuits/services/simulator'

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data || {}
  if (msg.type === 'simulate' && msg.circuit) {
    try {
      const res = await runSimulation(msg.circuit)
      ;(self as any).postMessage({ ok: true, result: res })
    } catch (e: any) {
      ;(self as any).postMessage({ ok: false, error: String(e?.message || e) })
    }
    return
  }
  if (msg.cmd === 'ping') {
    ;(self as any).postMessage({ ok: true, pong: true })
    return
  }
  ;(self as any).postMessage({ error: 'unknown_cmd' })
}
