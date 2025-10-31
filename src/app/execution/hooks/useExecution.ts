import { useState, useCallback } from 'react'
import { submitJob } from '../services/executor'

export function useExecution() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle'|'running'|'done'>('idle')

  const run = useCallback(async (payload: unknown) => {
    setStatus('running')
    const { id } = await submitJob(payload)
    setJobId(id)
    setStatus('done')
  }, [])

  return { jobId, status, run }
}


