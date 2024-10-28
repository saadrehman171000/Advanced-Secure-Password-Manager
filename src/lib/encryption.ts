import crypto from 'crypto';

// Function to encrypt plaintext using DES
export function encryptDES(plaintext: string, key: string): string {
    if (key.length !== 8) {
        throw new Error('Key must be 8 bytes long.');
    }

    const iv = Buffer.alloc(8); // Initialization vector for DES
    const cipher = crypto.createCipheriv('des-ecb', Buffer.from(key, 'utf8'), iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt ciphertext using DES
export function decryptDES(ciphertext: string, key: string): string {
    if (key.length !== 8) {
        throw new Error('Key must be 8 bytes long.');
    }

    const iv = Buffer.alloc(8); // Initialization vector for DES
    const decipher = crypto.createDecipheriv('des-ecb', Buffer.from(key, 'utf8'), iv);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
