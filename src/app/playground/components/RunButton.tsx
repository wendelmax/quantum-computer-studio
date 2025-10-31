import React from 'react'
import Button from '../../../components/Button'

export default function RunButton({ onRun }: { onRun: ()=>void }) {
  return <Button onClick={onRun}>Run</Button>
}


