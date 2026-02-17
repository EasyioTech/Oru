import crypto from 'crypto';
import { AppError } from './errors.js';

// Use APP_SECRET or fall back to JWT_SECRET for encryption key
const SECRET_KEY = process.env.APP_SECRET || process.env.JWT_SECRET || 'fallback-secret-key-must-be-32-chars-long';
const ALGORITHM = 'aes-256-gcm';

// Ensure key is 32 bytes for aes-256-gcm
const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);

export const encrypt = (text: string): string => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        throw new AppError('Encryption failed', 500, 'ENCRYPTION_ERROR');
    }
};

export const decrypt = (text: string): string => {
    try {
        const parts = text.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const [ivHex, authTagHex, encryptedHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new AppError('Decryption failed', 500, 'DECRYPTION_ERROR');
    }
};
