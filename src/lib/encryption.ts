import crypto from 'crypto';

// Function to encrypt plaintext using DES
export function encryptDES(plaintext: string, key: string): string {
    if (key.length !== 8) {
        throw new Error('Key must be 8 bytes long.');
    }

    const cipher = crypto.createCipheriv('des-ecb', Buffer.from(key, 'utf8'), null);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt ciphertext using DES
export function decryptDES(ciphertext: string, key: string): string {
    if (key.length !== 8) {
        throw new Error('Key must be 8 bytes long.');
    }

    const decipher = crypto.createDecipheriv('des-ecb', Buffer.from(key, 'utf8'), null);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Example usage (you can remove this part later)
const key = '12345678'; // Use a secure key in production
const plaintext = 'Hello, World!';

const encryptedText = encryptDES(plaintext, key);
console.log('Encrypted Text:', encryptedText);

const decryptedText = decryptDES(encryptedText, key);
console.log('Decrypted Text:', decryptedText);
