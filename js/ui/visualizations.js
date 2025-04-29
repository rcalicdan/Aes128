// UI visualizations
import elements from './elements.js';

// Initialize state grid
export function initStateGrid() {
    elements.stateGrid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'state-grid-cell';
        cell.textContent = '00';
        elements.stateGrid.appendChild(cell);
    }
}

// Display key in a user-friendly format
export function displayKey(key) {
    let hexKey = '';
    for (let i = 0; i < key.length; i++) {
        hexKey += key.charCodeAt(i).toString(16).padStart(2, '0');
        if (i % 2 === 1 && i < key.length - 1) hexKey += ' ';
    }
    elements.keyDisplay.textContent = hexKey;
}

// Update visualization of the state grid
export function updateVisualization(state, operation) {
    // Update state grid
    const cells = elements.stateGrid.querySelectorAll('.state-grid-cell');
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

    elements.stateExplanation.textContent = explanation;
}

// Update round progress bar
export function updateRoundProgress(round, operation) {
    const progressBar = elements.progressBar;
    if (!progressBar) return;
    
    const totalOperations = 44; // Initial + 10 rounds * 4 operations + final
    const currentOperation = round * 4 + operation;
    const progressPercentage = (currentOperation / totalOperations) * 100;
    
    progressBar.style.width = progressPercentage + '%';
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    
    // Change color based on progress
    if (progressPercentage < 30) {
        progressBar.className = 'progress-bar bg-info';
    } else if (progressPercentage < 70) {
        progressBar.className = 'progress-bar bg-primary';
    } else if (progressPercentage < 90) {
        progressBar.className = 'progress-bar bg-warning';
    } else {
        progressBar.className = 'progress-bar bg-success';
    }
}

// Update round summary display
export function updateRoundSummary(roundStates) {
    const summaryContainer = elements.roundSummary;
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    
    // Add each round that has been calculated
    for (let i = 0; i < roundStates.length; i++) {
        if (roundStates[i]) {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'col-md-3 col-sm-4 col-6';
            
            const stateHex = roundStates[i].map(b => 
                b.toString(16).padStart(2, '0')
            ).join(' ');
            
            roundDiv.innerHTML = `
                <div class="card mb-2 round-summary-card" data-round="${i}">
                    <div class="card-header p-2 ${i === roundStates.length - 1 ? 'bg-success text-white' : ''}">
                        ${i === 0 ? 'Initial' : 'Round ' + i}
                    </div>
                    <div class="card-body p-2">
                        <div class="small text-muted font-monospace" style="font-size: 0.7rem; overflow: hidden; text-overflow: ellipsis;">
                            ${stateHex}
                        </div>
                    </div>
                </div>
            `;
            
            summaryContainer.appendChild(roundDiv);
        }
    }

    // Add click handlers to round summary cards
    document.querySelectorAll('.round-summary-card').forEach(card => {
        card.addEventListener('click', () => {
            const round = card.getAttribute('data-round');
            elements.roundSelector.value = round === '0' ? 'initial' : round;
            elements.roundSelector.dispatchEvent(new Event('change'));
        });
    });
}

// Generate S-box grid for visualization
export function generateSBoxGrid() {
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
export function generateShiftRowsDiagram() {
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