self.onmessage = async (e: MessageEvent) => {
  const { type, id } = e.data || {}
  if (type === 'run' && id) {
    await new Promise(r=> setTimeout(r, 100))
    ;(self as any).postMessage({ ok: true, id })
    return
  }
  ;(self as any).postMessage({ ok: false, error: 'bad_msg' })
}


