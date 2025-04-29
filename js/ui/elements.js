export default {
    // Key elements
    keyChoiceRadios: document.querySelectorAll('input[name="key-choice"]'),
    keyInputContainer: document.getElementById('key-input-container'),
    generatedKeyDisplay: document.getElementById('generated-key-display'),
    keyDisplay: document.getElementById('key-display'),
    regenerateKeyBtn: document.getElementById('regenerate-key'),
    customKeyInput: document.getElementById('custom-key'),
    
    // Control buttons
    encryptBtn: document.getElementById('encrypt-btn'),
    stepBtn: document.getElementById('step-btn'),
    resetBtn: document.getElementById('reset-btn'),
    
    // Visualization elements
    stateGrid: document.getElementById('state-grid'),
    stateExplanation: document.getElementById('state-explanation'),
    roundSelector: document.getElementById('round-selector'),
    
    // Operation tabs
    operationTabs: document.querySelectorAll('[data-tab]'),
    
    // Result tabs and displays
    resultTabs: document.querySelectorAll('[data-result]'),
    resultDisplays: {
        'hex': document.getElementById('hex-content'),
        'b64': document.getElementById('b64-content'),
        'bin': document.getElementById('bin-content')
    },
    
    // Progress elements
    progressBar: document.getElementById('round-progress-bar'),
    roundSummary: document.getElementById('round-summary'),
    
    // Input elements
    plaintextInput: document.getElementById('plaintext')
};