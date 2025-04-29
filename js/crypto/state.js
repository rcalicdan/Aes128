// Encryption state management
export default class AesState {
    constructor() {
        this.currentKey = '';
        this.currentState = new Array(16).fill(0);
        this.currentStep = 0;
        this.totalSteps = 43; // Initial + 10 rounds * 4 operations - 1 (last round has no MixColumns)
        this.roundStates = [];  // To store state after each round
        this.roundKeys = [];    // To store round keys
    }

    // Initialize with plaintext
    initWithPlaintext(plaintext) {
        this.currentState = new Array(16).fill(0);
        for (let i = 0; i < 16; i++) {
            this.currentState[i] = i < plaintext.length ? plaintext.charCodeAt(i) : 0;
        }
    }

    // Set current key and expand it
    setKey(key) {
        this.currentKey = key;
        // Convert current key to byte array
        const keyBytes = Array.from(key).map(c => c.charCodeAt(0));
        // Generate round keys
        this.roundKeys = expandKey(keyBytes);
    }

    // Reset state
    reset() {
        this.currentState = new Array(16).fill(0);
        this.currentStep = 0;
        this.roundStates = [];
        this.roundKeys = [];
    }

    // Store state for a round
    storeRoundState(round) {
        this.roundStates[round] = [...this.currentState];
    }
}

// Import expandKey from keyManager
import { expandKey } from './keyManager.js';