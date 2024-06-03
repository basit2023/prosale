import { AES, enc } from 'crypto-js';

// Function to encrypt data
export function encryptData(data:any) {
    const secretKey="prosalewebsite"
    const encryptedData = AES.encrypt(JSON.stringify(data), secretKey).toString();
    return encryptedData;
}

// Function to decrypt data
export function decryptData(encryptedData:any) {
    const secretKey="prosalewebsite"
    const decryptedData = AES.decrypt(encryptedData, secretKey).toString(enc.Utf8);
    return JSON.parse(decryptedData);
}
