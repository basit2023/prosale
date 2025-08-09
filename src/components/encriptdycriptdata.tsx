import { AES, enc } from 'crypto-js';

// Function to encrypt data with salt
export function encryptData(data: any) {
 
    const secretKey = "prosalewebsite";
    const salt = "randomsalt123";
    const saltedData = salt + JSON.stringify(data); // Combine salt with data
    const encryptedData = AES.encrypt(saltedData, secretKey).toString();
    return encryptedData;
}

// Function to decrypt data with salt
export function decryptData(encryptedData: any) {
    const secretKey = "prosalewebsite";
    const salt = "randomsalt123";
    if (!encryptedData) {
        return null;
    }
    try {
        const bytes = AES.decrypt(encryptedData, secretKey);
        const decryptedData = bytes.toString(enc.Utf8);
        if (!decryptedData || !decryptedData.startsWith(salt)) {
            // Decryption failed or salt missing
            return null;
        }
        const dataWithoutSalt = decryptedData.replace(salt, '');
        return JSON.parse(dataWithoutSalt);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}


export function encodeId(id: string | number): string {

  const idString = String(id);
  const encoded = Buffer.from(idString).toString('base64');
  return encoded.replace(/=/g, ''); 
}

export function decodeId(encodedId: string): string {
  
  const padding = '='.repeat((4 - (encodedId.length % 4)) % 4);
  const base64String = encodedId + padding;

  
  const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
  return decoded;
}






// import { AES, enc } from 'crypto-js';

// // Function to encrypt data
// export function encryptData(data:any) {
//     const secretKey="prosalewebsite"
//     const encryptedData = AES.encrypt(JSON.stringify(data), secretKey).toString();
//     return encryptedData;
// }

// // Function to decrypt data
// export function decryptData(encryptedData:any) {
//     const secretKey = "prosalewebsite";
//     const decryptedBytes = AES.decrypt(encryptedData, secretKey);
    
//     if (decryptedBytes && decryptedBytes.toString()) {
//         const decryptedData = decryptedBytes.toString(enc.Utf8);
//         return JSON.parse(decryptedData);
//     } else {
       
//         console.error("Decryption failed or returned empty data.");
//         return null; 
//     }
// }
