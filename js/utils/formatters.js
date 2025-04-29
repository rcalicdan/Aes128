// Data formatting utilities

// Update result display based on format
export function updateResultDisplay(format, encryptedData, displayElement) {
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

    displayElement.innerHTML = `
        <div class="p-3 bg-light rounded font-monospace">
            ${displayText}
        </div>
    `;
}