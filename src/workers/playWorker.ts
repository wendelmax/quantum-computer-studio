self.onmessage = async (e: MessageEvent) => {
  const { type, code } = e.data || {}
  if (type === 'run' && typeof code === 'string') {
    await new Promise(r=> setTimeout(r, 50))
    ;(self as any).postMessage({ ok: true, output: 'Executed.' })
    return
  }
  ;(self as any).postMessage({ ok: false, error: 'bad_msg' })
}


