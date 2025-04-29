document.addEventListener('DOMContentLoaded', function () {
    // Main variables
    let currentKey = '';
    let currentState = new Array(16).fill(0);
    let currentStep = 0;
    const totalSteps = 44; // Initial + 10 rounds * 4 operations + final

    // Elements
    const keyChoiceRadios = document.querySelectorAll('input[name="key-choice"]');
    const keyInputContainer = document.getElementById('key-input-container');
    const generatedKeyDisplay = document.getElementById('generated-key-display');
    const keyDisplay = document.getElementById('key-display');
    const regenerateKeyBtn = document.getElementById('regenerate-key');
    const encryptBtn = document.getElementById('encrypt-btn');
    const stepBtn = document.getElementById('step-btn');
    const resetBtn = document.getElementById('reset-btn');
    const stateGrid = document.getElementById('state-grid');
    const stateExplanation = document.getElementById('state-explanation');
    const roundSelector = document.getElementById('round-selector');
    const operationTabs = document.querySelectorAll('[data-tab]');
    const resultTabs = document.querySelectorAll('[data-result]');
    const resultDisplays = {
        'hex': document.getElementById('hex-content'),
        'b64': document.getElementById('b64-content'),
        'bin': document.getElementById('bin-content')
    };

    // Initialize state grid
    function initStateGrid() {
        stateGrid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'state-grid-cell';
            cell.textContent = '00';
            stateGrid.appendChild(cell);
        }
    }

    // Generate a random 128-bit key (16 bytes)
    function generateRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let key = '';
        for (let i = 0; i < 16; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    // Display key in a user-friendly format
    function displayKey(key) {
        let hexKey = '';
        for (let i = 0; i < key.length; i++) {
            hexKey += key.charCodeAt(i).toString(16).padStart(2, '0');
            if (i % 2 === 1 && i < key.length - 1) hexKey += ' ';
        }
        keyDisplay.textContent = hexKey;
    }

    // Initialize with a random key
    currentKey = generateRandomKey();
    displayKey(currentKey);
    initStateGrid();

    // Set up event listeners for key options
    keyChoiceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'custom') {
                keyInputContainer.style.display = 'block';
                generatedKeyDisplay.style.display = 'none';
            } else {
                keyInputContainer.style.display = 'none';
                generatedKeyDisplay.style.display = 'block';
            }
        });
    });

    // Regenerate key button
    regenerateKeyBtn.addEventListener('click', () => {
        currentKey = generateRandomKey();
        displayKey(currentKey);
    });

    // AES Operations
    // Simplified SubBytes operation
    function performSubBytes(state) {
        const result = [...state];
        for (let i = 0; i < state.length; i++) {
            // Simplified S-box transformation for visualization
            result[i] = (state[i] + 0x63) % 256;
        }
        return result;
    }

    // ShiftRows operation
    function performShiftRows(state) {
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
    function performMixColumns(state) {
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
    function performAddRoundKey(state, roundKey) {
        // XOR state with round key
        return state.map((byte, i) => byte ^ roundKey[i]);
    }

    // Update visualization of the state grid
    function updateVisualization(state, operation) {
        // Update state grid
        const cells = stateGrid.querySelectorAll('.state-grid-cell');
        for (let i = 0; i < state.length; i++) {
            cells[i].textContent = state[i].toString(16).padStart(2, '0');

            // Add animation class
            cells[i].classList.add('updated');
            setTimeout(() => {
                cells[i].classList.remove('updated');
            }, 1000);
        }

        // Update explanation based on operation
        let explanation = '';
        switch (operation) {
            case 'sub-bytes':
                explanation = 'SubBytes: Each byte is replaced with another byte according to a substitution box (S-box). This provides confusion in the cipher.';
                break;
            case 'shift-rows':
                explanation = 'ShiftRows: Each row of the state is cyclically shifted to the left. Row 0 is not shifted, row 1 shifts by 1, row 2 by 2, and row 3 by 3. This helps diffuse the bits.';
                break;
            case 'mix-columns':
                explanation = 'MixColumns: A linear transformation that combines the bytes in each column. This ensures each byte affects multiple bytes in the next round.';
                break;
            case 'add-round-key':
                explanation = 'AddRoundKey: Each byte of the state is XORed with the corresponding byte from the round key. This introduces the key material into the cipher.';
                break;
            default:
                explanation = 'AES-128 processes data in blocks of 16 bytes arranged in a 4×4 matrix called the state. Choose an operation to learn more.';
        }

        stateExplanation.textContent = explanation;
    }

    // Update tab content for each operation
    function updateTabContent(operation) {
        // Get the tab pane element
        const tabId = `${operation}-content`;
        const tabPane = document.getElementById(tabId);

        if (!tabPane) return;

        let content = '';

        switch (operation) {
            case 'sub-bytes':
                content = `
                    <h4>SubBytes Transformation</h4>
                    <p>Uses an S-box to perform a byte-by-byte substitution of the state.</p>
                    <div class="card mb-3">
                        <div class="card-header">S-box (simplified)</div>
                        <div class="card-body">
                            <div class="s-box-grid">
                                ${generateSBoxGrid()}
                            </div>
                        </div>
                    </div>
                    <p class="math-note">Each byte is transformed independently, providing non-linearity to the cipher.</p>
                `;
                break;

            case 'shift-rows':
                content = `
                    <h4>ShiftRows Transformation</h4>
                    <p>Cyclically shifts each row of the state to the left:</p>
                    <ul class="list-group mb-3">
                        <li class="list-group-item">Row 0: No shift</li>
                        <li class="list-group-item">Row 1: Shift left by 1</li>
                        <li class="list-group-item">Row 2: Shift left by 2</li>
                        <li class="list-group-item">Row 3: Shift left by 3</li>
                    </ul>
                    <div class="card">
                        <div class="card-body">
                            <div class="shift-diagram">
                                ${generateShiftRowsDiagram()}
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'mix-columns':
                content = `
                    <h4>MixColumns Transformation</h4>
                    <p>Each column of the state is transformed using a linear transformation.</p>
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="mix-columns-diagram">
                                <div class="matrix-multiplication">
                                    <div class="matrix">
                                        <div>2 3 1 1</div>
                                        <div>1 2 3 1</div>
                                        <div>1 1 2 3</div>
                                        <div>3 1 1 2</div>
                                    </div>
                                    <div>×</div>
                                    <div class="column-matrix">
                                        <div>a</div>
                                        <div>b</div>
                                        <div>c</div>
                                        <div>d</div>
                                    </div>
                                    <div>=</div>
                                    <div class="result-matrix">
                                        <div>2a⊕3b⊕c⊕d</div>
                                        <div>a⊕2b⊕3c⊕d</div>
                                        <div>a⊕b⊕2c⊕3d</div>
                                        <div>3a⊕b⊕c⊕2d</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="math-note">All operations are in GF(2^8) with the AES irreducible polynomial.</p>
                `;
                break;

            case 'add-round-key':
                content = `
                    <h4>AddRoundKey Transformation</h4>
                    <p>Each byte of the state is XORed with the corresponding byte of the round key.</p>
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="add-round-key-diagram">
                                <div class="xor-operation">
                                    <div class="state-matrix">State</div>
                                    <div>⊕</div>
                                    <div class="key-matrix">Round Key</div>
                                    <div>=</div>
                                    <div class="result-matrix">New State</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p>The round keys are derived from the original cipher key using the Key Expansion routine.</p>
                `;
                break;
        }

        tabPane.innerHTML = content;
    }

    // Generate S-box grid for visualization
    function generateSBoxGrid() {
        let html = '';
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = (row * 4 + col) * 16 + 0x63;
                html += `<div class="s-box-cell">${value.toString(16)}</div>`;
            }
        }
        return html;
    }

    // Generate ShiftRows diagram
    function generateShiftRowsDiagram() {
        return `
            <div class="shift-row">
                <div class="before">a₀₀ a₀₁ a₀₂ a₀₃</div>
                <div class="arrow">→</div>
                <div class="after">a₀₀ a₀₁ a₀₂ a₀₃</div>
            </div>
            <div class="shift-row">
                <div class="before">a₁₀ a₁₁ a₁₂ a₁₃</div>
                <div class="arrow">→</div>
                <div class="after">a₁₁ a₁₂ a₁₃ a₁₀</div>
            </div>
            <div class="shift-row">
                <div class="before">a₂₀ a₂₁ a₂₂ a₂₃</div>
                <div class="arrow">→</div>
                <div class="after">a₂₂ a₂₃ a₂₀ a₂₁</div>
            </div>
            <div class="shift-row">
                <div class="before">a₃₀ a₃₁ a₃₂ a₃₃</div>
                <div class="arrow">→</div>
                <div class="after">a₃₃ a₃₀ a₃₁ a₃₂</div>
            </div>
        `;
    }

    // Update result display based on format
    function updateResultDisplay(format, encryptedData) {
        // Use mock data if no encrypted data is provided
        const data = encryptedData || Array(16).fill(0).map((_, i) => (i * 17) % 256);

        let displayText = '';
        switch (format) {
            case 'hex':
                displayText = data.map(b => b.toString(16).padStart(2, '0')).join(' ');
                break;
            case 'b64':
                // Simple base64 encoding simulation
                try {
                    // Create byte array
                    const byteArray = new Uint8Array(data);
                    // Convert to binary string
                    const binaryString = Array.from(byteArray)
                        .map(byte => String.fromCharCode(byte))
                        .join('');
                    // Convert to base64
                    displayText = btoa(binaryString);
                } catch (e) {
                    displayText = 'QUVTLTEyOCBFbmNyeXB0aW9uIERlbW8='; // Fallback
                }
                break;
            case 'bin':
                displayText = data.slice(0, 4).map(b => b.toString(2).padStart(8, '0')).join(' ') +
                    '<br><small class="text-muted">(First 4 bytes shown)</small>';
                break;
        }

        resultDisplays[format].innerHTML = `
            <div class="p-3 bg-light rounded font-monospace">
                ${displayText}
            </div>
        `;
    }

    // Initialize tab content for all operations
    function initTabContent() {
        updateTabContent('sub-bytes');
        updateTabContent('shift-rows');
        updateTabContent('mix-columns');
        updateTabContent('add-round-key');
    }

    // Tab switching functionality using Bootstrap's tab events
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', event => {
            const operation = event.target.getAttribute('data-tab');
            if (operation) {
                // Handle operation tab click
                const newState = processOperation(operation);
                updateVisualization(newState, operation);
            }

            const resultFormat = event.target.getAttribute('data-result');
            if (resultFormat) {
                // Handle result tab click
                updateResultDisplay(resultFormat);
            }
        });
    });

    // Process a specific AES operation
    function processOperation(operation) {
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
                // Create a simple round key for demonstration
                const roundKey = Array(16).fill(0).map((_, i) => i * 7 % 256);
                newState = performAddRoundKey([...currentState], roundKey);
                break;
            default:
                newState = [...currentState];
        }
        return newState;
    }
    // Step through the encryption process
    stepBtn.addEventListener('click', () => {
        if (currentStep >= totalSteps) {
            currentStep = 0;
            currentState = new Array(16).fill(0);
        }

        // Initialize state with plaintext on first step
        if (currentStep === 0) {
            const plaintext = document.getElementById('plaintext').value;
            for (let i = 0; i < 16; i++) {
                currentState[i] = i < plaintext.length ? plaintext.charCodeAt(i) : 0;
            }
        }

        // Determine which operation to perform based on step
        const round = Math.floor(currentStep / 4);
        const operation = currentStep % 4;

        const operations = ['sub-bytes', 'shift-rows', 'mix-columns', 'add-round-key'];
        let opName = operations[operation];

        // Last round doesn't have MixColumns
        if (round === 10 && operation === 2) {
            opName = 'add-round-key';
        }

        // Update round selector
        roundSelector.value = round === 0 ? 'initial' : round.toString();

        // Show the appropriate tab
        const tabElement = document.querySelector(`[data-tab="${opName}"]`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }

        // Perform operation
        switch (opName) {
            case 'sub-bytes':
                currentState = performSubBytes(currentState);
                break;
            case 'shift-rows':
                currentState = performShiftRows(currentState);
                break;
            case 'mix-columns':
                currentState = performMixColumns(currentState);
                break;
            case 'add-round-key':
                // Create a simple round key for demonstration
                const roundKey = Array(16).fill(0).map((_, i) => ((i * 7) + round * 3) % 256);
                currentState = performAddRoundKey(currentState, roundKey);
                break;
        }

        updateVisualization(currentState, opName);
        currentStep++;

        // Show encrypted result after final step
        if (currentStep >= totalSteps) {
            // Update all result formats
            updateResultDisplay('hex', currentState);
            updateResultDisplay('b64', currentState);
            updateResultDisplay('bin', currentState);

            // Show the hex tab
            const hexTab = document.getElementById('hex-tab');
            if (hexTab) {
                const tab = new bootstrap.Tab(hexTab);
                tab.show();
            }
        }
    });

    // Reset button functionality
    resetBtn.addEventListener('click', () => {
        currentStep = 0;
        currentState = new Array(16).fill(0);
        initStateGrid();
        updateVisualization(currentState, '');

        // Reset result displays
        Object.keys(resultDisplays).forEach(format => {
            resultDisplays[format].innerHTML = '<div class="result-placeholder p-3 bg-light rounded">Encrypted output will appear here</div>';
        });

        // Reset to initial tab
        const subBytesTab = document.getElementById('sub-bytes-tab');
        if (subBytesTab) {
            const tab = new bootstrap.Tab(subBytesTab);
            tab.show();
        }

        // Reset round selector
        roundSelector.value = 'initial';
    });

    // Encrypt button functionality
    encryptBtn.addEventListener('click', () => {
        // Reset and then run all steps
        resetBtn.click();

        // Fast forward through all steps
        for (let i = 0; i < totalSteps; i++) {
            stepBtn.click();
        }
    });

    // Round selector change handler
    roundSelector.addEventListener('change', function () {
        const round = this.value === 'initial' ? 0 : parseInt(this.value);

        // Calculate the step based on the round
        // Each round has 4 operations, so step = round * 4
        let targetStep = round * 4;

        // Reset and run up to the selected round
        resetBtn.click();
        for (let i = 0; i < targetStep; i++) {
            stepBtn.click();
        }
    });

    // Custom key input handler
    document.getElementById('custom-key').addEventListener('input', function () {
        if (this.value.length === 16) {
            currentKey = this.value;
            displayKey(currentKey);
        }
    });

    // Initialize the content
    initTabContent();
});