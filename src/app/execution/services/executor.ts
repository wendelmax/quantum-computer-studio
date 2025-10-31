export async function submitJob(payload: unknown): Promise<{ id: string }> {
  await new Promise(r => setTimeout(r, 100))
  return { id: Math.random().toString(36).slice(2) }
}


