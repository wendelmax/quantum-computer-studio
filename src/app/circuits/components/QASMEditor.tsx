import React, { useState, useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { parseQASM, circuitToQASM, type Circuit } from 'quantum-computer-js'
import Card from '../../../components/Card'

interface Props {
    circuit: Circuit
    onChange: (circuit: Circuit) => void
    onValidationError?: (error: string | null) => void
}

const QASMEditor: React.FC<Props> = ({ circuit, onChange, onValidationError }) => {
    const [code, setCode] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const isInternalChange = useRef(false)

    // Sync code when external circuit changes
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false
            return
        }
        try {
            const qasm = circuitToQASM(circuit)
            setCode(qasm)
            setError(null)
            onValidationError?.(null)
        } catch (err) {
            console.error('Failed to convert circuit to QASM:', err)
        }
    }, [circuit])

    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || ''
        setCode(newCode)

        try {
            const parsed = parseQASM(newCode)
            setError(null)
            onValidationError?.(null)
            isInternalChange.current = true
            onChange(parsed)
        } catch (err) {
            const msg = (err as Error).message
            setError(msg)
            onValidationError?.(msg)
        }
    }

    return (
        <Card
            title="OpenQASM 2.0 Editor"
            description="Write QASM code to update the visual circuit in real-time."
            className="h-full flex flex-col overflow-hidden"
        >
            <div className="flex-1 min-h-[300px] border border-theme-border rounded overflow-hidden relative">
                <Editor
                    height="100%"
                    defaultLanguage="cpp" // QASM doesn't have a built-in language, cpp is close-ish or just plain text
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 10, bottom: 10 }
                    }}
                />
                {error && (
                    <div className="absolute bottom-0 left-0 right-0 bg-rose-900/80 border-t border-rose-700 p-2 text-xs text-rose-100 backdrop-blur-sm z-10 transition-all">
                        <span className="font-bold mr-1">Error:</span> {error}
                    </div>
                )}
            </div>
        </Card>
    )
}

export default QASMEditor
