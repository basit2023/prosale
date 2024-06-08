import apiService from '@/utils/apiService';
import axios from 'axios';
import { AES, enc } from 'crypto-js';

export const fetchUserPermissions = async () => {
  try {
    // Retrieve encrypted user data from localStorage
    const encryptedData = localStorage.getItem('userData');

    if (!encryptedData) {
      console.error('No encrypted user data found in localStorage');
      return;
    }

    // Decrypt the user data
    const decryptedData = AES.decrypt(encryptedData, 'encryptionSecret');
    const userData:any = JSON.parse(decryptedData.toString(enc.Utf8));
    
    // Include user data in the request
    
    const response = await apiService.post('/permission', {
      params: {
        userId: userData.user.user_type,  // Adjust this based on your API requirements
        // Include other parameters as needed
      },
    });

    const userPermissions = response.data;
    return userPermissions;
    // Do something with the user permissions data
  } catch (error) {
    console.error('Error fetching user permissions:', error);
  }
};

export default fetchUserPermissions;
