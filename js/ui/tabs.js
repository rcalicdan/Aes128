// Tab content management
import elements from './elements.js';
import { generateSBoxGrid, generateShiftRowsDiagram } from './visualization.js';

// Update tab content for each operation
export function updateTabContent(operation) {
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

// Initialize tab content for all operations
export function initTabContent() {
    updateTabContent('sub-bytes');
    updateTabContent('shift-rows');
    updateTabContent('mix-columns');
    updateTabContent('add-round-key');
}