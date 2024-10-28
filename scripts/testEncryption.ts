import { encryptDES, decryptDES } from '../src/lib/encryption.js';


const key = 'ALISHAIK'; // Make sure the key is exactly 8 bytes
const originalText = 'TestPassword123';

// Encrypt the original text
const encryptedText = encryptDES(originalText, key);
console.log('Encrypted Text:', encryptedText);

// Decrypt the encrypted text
const decryptedText = decryptDES(encryptedText, key);
console.log('Decrypted Text:', decryptedText);

// Verify if the original text and decrypted text match
if (originalText === decryptedText) {
    console.log('Encryption/Decryption logic works correctly.');
} else {
    console.log('Encryption/Decryption logic failed.');
}
