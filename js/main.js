// Main entry point for the AES visualization application
import AesState from './crypto/state.js';
import { generateRandomKey } from './crypto/keyManager.js';
import { initStateGrid, displayKey } from './ui/visualization.js';
import { initTabContent } from './ui/tabs.js';
import { setupEventListeners } from './ui/events.js';

document.addEventListener('DOMContentLoaded', function () {
    // Create an instance of the AES state manager
    const aesState = new AesState();
    
    // Initialize with a random key
    aesState.currentKey = generateRandomKey();
    displayKey(aesState.currentKey);
    
    // Initialize UI components
    initStateGrid();
    initTabContent();
    
    // Set up event listeners
    setupEventListeners(aesState);
    
    console.log('AES-128 Encryption Explorer initialized');
});