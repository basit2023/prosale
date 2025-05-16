// utils/pushService.js
// import apiService from '@/utils/apiService';
// export const subscribeUser = async (email) => {
//   try {
//       const registration = await navigator.serviceWorker.ready;
//       const subscription = await registration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4")
//       });

//       // Send the subscription object directly in the POST request body
//       const response = await apiService.post(`/subscribe/${email}`, subscription);
//        console.log("the response from the user is:",response,response.status)
//       if (response.status !==201) {
//           throw new Error('Failed to save subscription');
//       }

//       console.log('User is subscribed:', subscription);
//   } catch (error) { 
//       console.error('Failed to subscribe the user:', error);
//   }
// };

// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - base64String.length % 4) % 4);
//   const base64 = (base64String + padding)
//       .replace(/-/g, '+')
//       .replace(/_/g, '/');

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }



// after the above issue 


// utils/pushService.js
// utils/pushService.js
import apiService from '@/utils/apiService';

export const subscribeUser = async (email) => {
  try {
    // Check if service workers and push manager are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Check if permission was granted
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4")
    });

    // Send subscription to server
    const response = await apiService.post(`/subscribe/${email}`, {
      subscription: JSON.stringify(subscription),
      email
    });

    if (response.status !== 201) {
      throw new Error('Failed to save subscription');
    }

    console.log('User subscribed:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user:', error);
    throw error;
  }
};

export const showPushNotification = (title, options) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
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