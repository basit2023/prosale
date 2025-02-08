// utils/pushService.js
import apiService from '@/utils/apiService';
export const subscribeUser = async (email) => {
  try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4")
      });

      // Send the subscription object directly in the POST request body
      const response = await apiService.post(`/subscribe/${email}`, subscription);
       console.log("the response from the user is:",response,response.status)
      if (response.status !==201) {
          throw new Error('Failed to save subscription');
      }

      console.log('User is subscribed:', subscription);
  } catch (error) {
      console.error('Failed to subscribe the user:', error);
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}