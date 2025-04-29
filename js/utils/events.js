// Event handlers
import elements from './elements.js';
import { generateRandomKey } from '../crypto/keyManager.js';
import { processOperation } from '../crypto/aes.js';
import {
    updateVisualization,
    displayKey,
    updateRoundProgress,
    updateRoundSummary
} from './visualization.js';
import { updateTabContent } from './tabs.js';
import { updateResultDisplay } from '../utils/formatters.js';

export function setupEventListeners(aesState) {
    // Set up event listeners for key options
    elements.keyChoiceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'custom') {
                elements.keyInputContainer.style.display = 'block';
                elements.generatedKeyDisplay.style.display = 'none';
            } else {
                elements.keyInputContainer.style.display = 'none';
                elements.generatedKeyDisplay.style.display = 'block';
            }
        });
    });

    // Regenerate key button
    elements.regenerateKeyBtn.addEventListener('click', () => {
        aesState.currentKey = generateRandomKey();
        displayKey(aesState.currentKey);
    });

    // Custom key input handler
    elements.customKeyInput.addEventListener('input', function () {
        if (this.value.length === 16) {
            aesState.currentKey = this.value;
            displayKey(aesState.currentKey);
        }
    });

    // Tab switching functionality
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', event => {
            const operation = event.target.getAttribute('data-tab');
            if (operation) {
                // Handle operation tab click
                const newState = processOperation(
                    operation,
                    aesState.currentState,
                    aesState.roundKeys,
                    aesState.currentStep
                );
                updateVisualization(newState, operation);
            }

            const resultFormat = event.target.getAttribute('data-result');
            if (resultFormat) {
                // Handle result tab click
                updateResultDisplay(
                    resultFormat,
                    null,
                    elements.resultDisplays[resultFormat]
                );
            }
        });
    });

    // Step button handler
    elements.stepBtn.addEventListener('click', () => handleStep(aesState));

    // Reset button handler
    elements.resetBtn.addEventListener('click', () => handleReset(aesState));

    // Round selector change handler
    elements.roundSelector.addEventListener('change', function () {
        handleRoundChange(this.value, aesState);
    });

    // Encrypt button handler
    elements.encryptBtn.addEventListener('click', () => {
        // Reset and then run all steps
        handleReset(aesState);

        // Fast forward through all steps
        const totalStepsToRun = aesState.totalSteps;
        let stepsRun = 0;

        function runNextStep() {
            if (stepsRun < totalStepsToRun) {
                handleStep(aesState);
                stepsRun++;
                setTimeout(runNextStep, 50); // Run steps with a small delay to show progress
            }
        }

        runNextStep();
    });
}

// Step through encryption process
function handleStep(aesState) {
    if (aesState.currentStep === 0) {
        // Initialize with plaintext and generate round keys
        const plaintext = elements.plaintextInput.value;
        aesState.initWithPlaintext(plaintext);

        // Set and expand the key
        aesState.setKey(aesState.currentKey);

        // Store initial state
        aesState.roundStates = [[...aesState.currentState]];
    }

    // Determine which operation to perform
    const round = Math.floor(aesState.currentStep / 4);
    const operation = aesState.currentStep % 4;

    const operations = ['sub-bytes', 'shift-rows', 'mix-columns', 'add-round-key'];
    let opName = operations[operation];

    // Last round doesn't have MixColumns
    if (round === 10 && operation === 2) {
        opName = 'add-round-key';
    }

    // Update round selector
    elements.roundSelector.value = round === 0 ? 'initial' : round.toString();

    // Update round progress bar
    updateRoundProgress(round, operation);

    // Perform operation using imported function
    aesState.currentState = processOperation(
        opName,
        aesState.currentState,
        aesState.roundKeys,
        aesState.currentStep
    );

    // Store state after each complete round
    if (operation === 3 || (round === 10 && operation === 2)) {
        if (!aesState.roundStates[round + 1]) {
            aesState.roundStates[round + 1] = [...aesState.currentState];
            updateRoundSummary(aesState.roundStates);
        }
    }

    // Show appropriate tab
    const tabElement = document.querySelector(`[data-tab="${opName}"]`);
    if (tabElement) {
        const tab = new bootstrap.Tab(tabElement);
        tab.show();
    }

    updateVisualization(aesState.currentState, opName);
    aesState.currentStep++;

    // Show encrypted result after final step
    if (aesState.currentStep >= aesState.totalSteps) {
        // Update all result formats
        Object.keys(elements.resultDisplays).forEach(format => {
            updateResultDisplay(
                format,
                aesState.currentState,
                elements.resultDisplays[format]
            );
        });

        // Show the hex tab
        const hexTab = document.getElementById('hex-tab');
        if (hexTab) {
            const tab = new bootstrap.Tab(hexTab);
            tab.show();
        }
    }
}

// Handle reset
function handleReset(aesState) {
    aesState.reset();

    // Reset UI
    const cells = elements.stateGrid.querySelectorAll('.state-grid-cell');
    cells.forEach(cell => {
        cell.textContent = '00';
        cell.classList.remove('updated');
    });

    // Reset progress bar
    if (elements.progressBar) {
        elements.progressBar.style.width = '0%';
        elements.progressBar.setAttribute('aria-valuenow', 0);
        elements.progressBar.className = 'progress-bar';
    }

    // Reset result displays
    Object.keys(elements.resultDisplays).forEach(format => {
        elements.resultDisplays[format].innerHTML = '<div class="result-placeholder p-3 bg-light rounded">Encrypted output will appear here</div>';
    });

    // Reset round summary
    if (elements.roundSummary) {
        elements.roundSummary.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    Complete rounds will appear here as they are processed
                </div>
            </div>
        `;
    }

    // Reset to initial tab
    const subBytesTab = document.getElementById('sub-bytes-tab');
    if (subBytesTab) {
        const tab = new bootstrap.Tab(subBytesTab);
        tab.show();
    }

    // Reset round selector
    elements.roundSelector.value = 'initial';
}

// Handle round selector change (continued)
function handleRoundChange(value, aesState) {
    const round = value === 'initial' ? 0 : parseInt(value);

    // If we haven't computed this round yet, we need to calculate up to that point
    if (!aesState.roundStates[round] && round > 0) {
        // Reset and compute up to the selected round
        handleReset(aesState);
        for (let i = 0; i < round * 4; i++) {
            handleStep(aesState);
        }
    } else {
        // We've already computed this round, just show it
        if (aesState.roundStates[round]) {
            aesState.currentState = [...aesState.roundStates[round]];
            updateVisualization(aesState.currentState, '');

            // Set currentStep based on round
            aesState.currentStep = round * 4;

            // Update progress bar
            updateRoundProgress(round, 0);
        }
    }

    // Update explanation based on selected round
    let roundExplanation = '';
    if (round === 0) {
        roundExplanation = 'Initial state after plaintext is loaded and initial AddRoundKey is performed.';
    } else if (round === 10) {
        roundExplanation = 'Final round (Round 10) - includes SubBytes, ShiftRows, and AddRoundKey (no MixColumns).';
    } else {
        roundExplanation = `Round ${round} - includes all four operations: SubBytes, ShiftRows, MixColumns, and AddRoundKey.`;
    }
    elements.stateExplanation.textContent = roundExplanation;
}