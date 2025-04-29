// Key management functions

// Generate a random 128-bit key (16 bytes)
export function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

// Simplified key expansion for visualization purposes
export function expandKey(masterKey) {
    const expandedKeys = [];
    let currentKey = [...masterKey];
    
    // Add the initial key
    expandedKeys.push([...currentKey]);
    
    // Generate 10 more round keys
    for (let round = 1; round <= 10; round++) {
        // Simplified key schedule - in real AES this is more complex
        const newKey = currentKey.map((byte, i) => 
            (byte + round * 11 + i * 7) % 256
        );
        expandedKeys.push(newKey);
        currentKey = newKey;
    }
    
    return expandedKeys;
}