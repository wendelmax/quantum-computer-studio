import type { Circuit, CircuitGate } from 'quantum-computer-js'

export function circuitToQASM3(circuit: Circuit): string {
    let qasm = `OPENQASM 3.1;\ninclude "stdgates.inc";\n\n`;
    const numQubits = circuit.numQubits || 1;
    qasm += `qubit[${numQubits}] q;\n`;
    qasm += `bit[${numQubits}] c;\n\n`;
    
    if (circuit.initialStates) {
        let hasInit = false;
        for (const [qStr, state] of Object.entries(circuit.initialStates)) {
            if (Number(state) === 1) {
                qasm += `x q[${qStr}];\n`;
                hasInit = true;
            }
        }
        if (hasInit) qasm += '\n';
    }
    
    circuit.gates.forEach(g => {
        const type = g.type.toLowerCase();
        const target = g.target;
        const control = g.control;
        const control2 = g.control2;
        const target2 = g.target2;
        const angle = g.angle;

        if (typeof control === 'number') {
            if (typeof control2 === 'number') {
                if (type === 'x') qasm += `ccx q[${control}], q[${control2}], q[${target}];\n`;
                else qasm += `ctrl @ ctrl @ ${type} q[${control}], q[${control2}], q[${target}];\n`;
            } else {
                if (type === 'x') qasm += `cx q[${control}], q[${target}];\n`;
                else if (type === 'z') qasm += `cz q[${control}], q[${target}];\n`;
                else if (type === 'y') qasm += `cy q[${control}], q[${target}];\n`;
                else if (type === 'h') qasm += `ch q[${control}], q[${target}];\n`;
                else if (type === 'swap' && typeof target2 === 'number') qasm += `cswap q[${control}], q[${target}], q[${target2}];\n`;
                else if (angle !== undefined) {
                    if (type === 'rx') qasm += `crx(${angle}) q[${control}], q[${target}];\n`;
                    else if (type === 'ry') qasm += `cry(${angle}) q[${control}], q[${target}];\n`;
                    else if (type === 'rz') qasm += `crz(${angle}) q[${control}], q[${target}];\n`;
                    else if (type === 'phase') qasm += `cp(${angle}) q[${control}], q[${target}];\n`;
                    else qasm += `ctrl @ ${type}(${angle}) q[${control}], q[${target}];\n`;
                } else {
                    qasm += `ctrl @ ${type} q[${control}], q[${target}];\n`;
                }
            }
        } else {
            if (type === 'swap' && typeof target2 === 'number') qasm += `swap q[${target}], q[${target2}];\n`;
            else if (angle !== undefined) {
                if (type === 'rx') qasm += `rx(${angle}) q[${target}];\n`;
                else if (type === 'ry') qasm += `ry(${angle}) q[${target}];\n`;
                else if (type === 'rz') qasm += `rz(${angle}) q[${target}];\n`;
                else if (type === 'phase') qasm += `p(${angle}) q[${target}];\n`;
                else qasm += `${type}(${angle}) q[${target}];\n`;
            } else {
                if (['x', 'y', 'z', 'h', 's', 't'].includes(type)) qasm += `${type} q[${target}];\n`;
                else if (type === 'sdg') qasm += `inv @ s q[${target}];\n`;
                else if (type === 'tdg') qasm += `inv @ t q[${target}];\n`;
                else qasm += `${type} q[${target}];\n`;
            }
        }
    });
    
    qasm += `\nc = measure q;\n`;
    
    return qasm;
}

export function parseQASM3(qasm: string): Circuit {
    const lines = qasm.split('\\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    const isQASM3 = lines.find(l => l.startsWith('OPENQASM 3.1') || l.startsWith('OPENQASM 3.0'));
    if (!isQASM3) {
        throw new Error("Invalid OpenQASM 3 string. Missing OPENQASM 3.1; declaration.");
    }

    let numQubits = 1;
    const qubitMatch = qasm.match(/qubit\\[(\\d+)\\]/);
    if (qubitMatch) {
        numQubits = parseInt(qubitMatch[1], 10);
    }
    
    const gates: CircuitGate[] = [];
    const initialStates: Record<number, '0' | '1'> = {};

    const gateRegex = /^(ctrl\\s+@\\s+|inv\\s+@\\s+)*([a-zA-Z0-9_]+)(?:\\(([^)]+)\\))?\\s+(.*);$/;

    lines.forEach(line => {
        if (line.startsWith('OPENQASM') || line.startsWith('include') || line.startsWith('qubit') || line.startsWith('bit') || line.startsWith('c = measure')) return;

        const match = line.match(gateRegex);
        if (!match) return;

        const modifiers = match[1] || '';
        let baseGate = match[2];
        const angleStr = match[3];
        const targetsStr = match[4];

        const targetMatches = [...targetsStr.matchAll(/\\[(\\d+)\\]/g)].map(m => parseInt(m[1], 10));
        let angle: number | undefined = undefined;
        if (angleStr) {
            angle = parseFloat(angleStr);
        }

        const isInv = modifiers.includes('inv @');
        
        const gateObj: CircuitGate = { type: '', target: 0 };

        if (baseGate === 'cx') { gateObj.type = 'x'; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'cy') { gateObj.type = 'y'; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'cz') { gateObj.type = 'z'; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'ch') { gateObj.type = 'h'; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'cswap') { gateObj.type = 'swap'; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; gateObj.target2 = targetMatches[2]; }
        else if (baseGate === 'ccx') { gateObj.type = 'x'; gateObj.control = targetMatches[0]; gateObj.control2 = targetMatches[1]; gateObj.target = targetMatches[2]; }
        else if (baseGate === 'crx') { gateObj.type = 'rx'; gateObj.angle = angle; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'cry') { gateObj.type = 'ry'; gateObj.angle = angle; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'crz') { gateObj.type = 'rz'; gateObj.angle = angle; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'cp') { gateObj.type = 'phase'; gateObj.angle = angle; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1]; }
        else if (baseGate === 'p') { gateObj.type = 'phase'; gateObj.angle = angle; gateObj.target = targetMatches[0]; }
        else if (baseGate === 'rx' || baseGate === 'ry' || baseGate === 'rz') { gateObj.type = baseGate; gateObj.angle = angle; gateObj.target = targetMatches[0]; }
        else if (baseGate === 'swap') { gateObj.type = 'swap'; gateObj.target = targetMatches[0]; gateObj.target2 = targetMatches[1]; }
        else if (baseGate === 's' && isInv) { gateObj.type = 'sdg'; gateObj.target = targetMatches[0]; }
        else if (baseGate === 't' && isInv) { gateObj.type = 'tdg'; gateObj.target = targetMatches[0]; }
        else if (modifiers.includes('ctrl @ ctrl @')) {
            gateObj.type = baseGate; gateObj.control = targetMatches[0]; gateObj.control2 = targetMatches[1]; gateObj.target = targetMatches[2];
        }
        else if (modifiers.includes('ctrl @')) {
            gateObj.type = baseGate; gateObj.control = targetMatches[0]; gateObj.target = targetMatches[1];
        } else {
            gateObj.type = baseGate; gateObj.target = targetMatches[0];
        }

        if (gateObj.type === 'x' && gates.length === 0 && !line.includes('ctrl')) {
            initialStates[gateObj.target] = '1';
        } else {
            gates.push(gateObj);
        }
    });

    return { numQubits, initialStates, gates };
}
