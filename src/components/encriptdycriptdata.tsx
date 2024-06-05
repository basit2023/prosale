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
    if(!encryptedData){
        return;
    }
    const decryptedData = AES.decrypt(encryptedData, secretKey).toString(enc.Utf8);
   
   
    
    const dataWithoutSalt = decryptedData.replace(salt, '');
    
    return JSON.parse(dataWithoutSalt);
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
