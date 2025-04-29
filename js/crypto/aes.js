// AES core operations

// Simplified SubBytes operation
export function performSubBytes(state) {
    const result = [...state];
    for (let i = 0; i < state.length; i++) {
        // Simplified S-box transformation for visualization
        result[i] = (state[i] + 0x63) % 256;
    }
    return result;
}

// ShiftRows operation
export function performShiftRows(state) {
    // Convert flat array to 4x4 grid (column-major order as in AES)
    const grid = [
        [state[0], state[4], state[8], state[12]],
        [state[1], state[5], state[9], state[13]],
        [state[2], state[6], state[10], state[14]],
        [state[3], state[7], state[11], state[15]]
    ];

    // Perform row shifts (0, 1, 2, 3 shifts)
    for (let row = 1; row < 4; row++) {
        const temp = [...grid[row]];
        for (let col = 0; col < 4; col++) {
            grid[row][col] = temp[(col + row) % 4];
        }
    }

    // Convert back to flat array (column-major)
    let result = [];
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
            result.push(grid[row][col]);
        }
    }
    return result;
}

// MixColumns operation (simplified)
export function performMixColumns(state) {
    const mixed = [...state];

    for (let col = 0; col < 4; col++) {
        const a = state[col * 4];
        const b = state[col * 4 + 1];
        const c = state[col * 4 + 2];
        const d = state[col * 4 + 3];

        // Simplified mix columns transformation
        mixed[col * 4] = (a + b) % 256;
        mixed[col * 4 + 1] = (b + c) % 256;
        mixed[col * 4 + 2] = (c + d) % 256;
        mixed[col * 4 + 3] = (d + a) % 256;
    }

    return mixed;
}

// AddRoundKey operation
export function performAddRoundKey(state, roundKey) {
    // XOR state with round key
    return state.map((byte, i) => byte ^ roundKey[i]);
}

// Process a specific AES operation
export function processOperation(operation, currentState, roundKeys, currentStep) {
    let newState;
    switch (operation) {
        case 'sub-bytes':
            newState = performSubBytes([...currentState]);
            break;
        case 'shift-rows':
            newState = performShiftRows([...currentState]);
            break;
        case 'mix-columns':
            newState = performMixColumns([...currentState]);
            break;
        case 'add-round-key':
            // Use the appropriate round key if available
            const round = Math.floor(currentStep / 4);
            const roundKey = roundKeys[round] || Array(16).fill(0).map((_, i) => i * 7 % 256);
            newState = performAddRoundKey([...currentState], roundKey);
            break;
        default:
            newState = [...currentState];
    }
    return newState;
}