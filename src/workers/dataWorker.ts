self.onmessage = (ev: MessageEvent) => {
  const { type, rows } = ev.data || {}
  if (type === 'normalize' && Array.isArray(rows)) {
    const numeric = rows.map((r: any[]) => r.map((v) => Number(v) || 0))
    ;(self as any).postMessage({ ok: true, rows: numeric })
    return
  }
  ;(self as any).postMessage({ ok: false, error: 'bad_msg' })
}


