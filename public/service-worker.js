// /**
//  * Copyright 2018 Google Inc. All Rights Reserved.
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// // If the loader is already loaded, just stop.
// if (!self.define) {
//   let registry = {};

//   // Used for `eval` and `importScripts` where we can't get script URL by other means.
//   // In both cases, it's safe to use a global var because those functions are synchronous.
//   let nextDefineUri;

//   const singleRequire = (uri, parentUri) => {
//     uri = new URL(uri + ".js", parentUri).href;
//     return registry[uri] || (

//         new Promise(resolve => {
//           if ("document" in self) {
//             const script = document.createElement("script");
//             script.src = uri;
//             script.onload = resolve;
//             document.head.appendChild(script);
//           } else {
//             nextDefineUri = uri;
//             importScripts(uri);
//             resolve();
//           }
//         })

//       .then(() => {
//         let promise = registry[uri];
//         if (!promise) {
//           throw new Error(`Module ${uri} didn’t register its module`);
//         }
//         return promise;
//       })
//     );
//   };

//   self.define = (depsNames, factory) => {
//     const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
//     if (registry[uri]) {
//       // Module is already loading or loaded.
//       return;
//     }
//     let exports = {};
//     const require = depUri => singleRequire(depUri, uri);
//     const specialDeps = {
//       module: { uri },
//       exports,
//       require
//     };
//     registry[uri] = Promise.all(depsNames.map(
//       depName => specialDeps[depName] || require(depName)
//     )).then(deps => {
//       factory(...deps);
//       return exports;
//     });
//   };
// }
// define(['./workbox-9ed6b7fc'], (function (workbox) { 'use strict';

//   importScripts();
//   self.skipWaiting();
//   workbox.clientsClaim();
//   workbox.registerRoute("/", new workbox.NetworkFirst({
//     "cacheName": "start-url",
//     plugins: [{
//       cacheWillUpdate: async ({
//         request,
//         response,
//         event,
//         state
//       }) => {
//         if (response && response.type === 'opaqueredirect') {
//           return new Response(response.body, {
//             status: 200,
//             statusText: 'OK',
//             headers: response.headers
//           });
//         }
//         return response;
//       }
//     }]
//   }), 'GET');
//   workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
//     "cacheName": "dev",
//     plugins: []
//   }), 'GET');

// }));
// //# sourceMappingURL=service-worker.js.map


/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
// if (!self.define) {
//   let registry = {};

//   let nextDefineUri;

//   const singleRequire = (uri, parentUri) => {
//     uri = new URL(uri + ".js", parentUri).href;
//     return registry[uri] || (
//       new Promise(resolve => {
//         if ("document" in self) {
//           const script = document.createElement("script");
//           script.src = uri;
//           script.onload = resolve;
//           document.head.appendChild(script);
//         } else {
//           nextDefineUri = uri;
//           importScripts(uri);
//           resolve();
//         }
//       })
//       .then(() => {
//         let promise = registry[uri];
//         if (!promise) {
//           throw new Error(`Module ${uri} didn’t register its module`);
//         }
//         return promise;
//       })
//     );
//   };

//   self.define = (depsNames, factory) => {
//     const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
//     if (registry[uri]) {
//       return;
//     }
//     let exports = {};
//     const require = depUri => singleRequire(depUri, uri);
//     const specialDeps = {
//       module: { uri },
//       exports,
//       require
//     };
//     registry[uri] = Promise.all(depsNames.map(
//       depName => specialDeps[depName] || require(depName)
//     )).then(deps => {
//       factory(...deps);
//       return exports;
//     });
//   };
// }

// define(['./workbox-9ed6b7fc'], function (workbox) {
//   'use strict';

//   importScripts();
//   self.skipWaiting();
//   workbox.clientsClaim();

//   workbox.registerRoute("/", new workbox.NetworkFirst({
//     "cacheName": "start-url",
//     plugins: [{
//       cacheWillUpdate: async ({ request, response, event, state }) => {
//         if (response && response.type === 'opaqueredirect') {
//           return new Response(response.body, {
//             status: 200,
//             statusText: 'OK',
//             headers: response.headers
//           });
//         }
//         return response;
//       }
//     }]
//   }), 'GET');

//   workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
//     "cacheName": "dev",
//     plugins: []
//   }), 'GET');

//   // ✅ Listen for 'push' events from the server
//   self.addEventListener('push', event => {
//     let data = {};
//     try {
//       data = event.data.json();
//     } catch (e) {
//       console.error("Error parsing push notification data:", e);
//     }

//     const title = data.title || 'New Notification';
//     const options = {
//       body: data.body || 'You have a new notification.',
//       icon: data.icon || '/icons/icon-192x192.png',
//       badge: data.badge || '/icons/badge-72x72.png',
//       data: { url: data.url || '/' } // Store URL for later opening
//     };

//     event.waitUntil(
//       self.registration.showNotification(title, options)
//     );
//   });

//   // ✅ Handle notification clicks
//   self.addEventListener('notificationclick', event => {
//     event.notification.close();

//     event.waitUntil(
//       clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
//         for (let client of clientList) {
//           if (client.url === event.notification.data.url && 'focus' in client) {
//             return client.focus();
//           }
//         }
//         if (clients.openWindow) {
//           return clients.openWindow(event.notification.data.url);
//         }
//       })
//     );
//   });

//   // ✅ Subscribe the user for push notifications
//   self.addEventListener('activate', async (event) => {
//     event.waitUntil(
//       self.registration.pushManager.getSubscription().then(async (subscription) => {
//         if (!subscription) {
//           console.log("🔔 No active subscription found. Subscribing now...");
//           const response = await fetch('/api/vapidPublicKey');
//           const vapidPublicKey = await response.text();
//           const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

//           return self.registration.pushManager.subscribe({
//             userVisibleOnly: true,
//             applicationServerKey: convertedVapidKey
//           }).then((newSubscription) => {
//             return fetch('/api/subscribe', {
//               method: 'POST',
//               body: JSON.stringify(newSubscription),
//               headers: {
//                 'Content-Type': 'application/json'
//               }
//             });
//           });
//         }
//       }).catch(error => {
//         console.error("Failed to subscribe user:", error);
//       })
//     );
//   });

//   // Convert VAPID key
//   function urlBase64ToUint8Array(base64String) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//         .replace(/-/g, '+')
//         .replace(/_/g, '/');

//     const rawData = atob(base64);
//     return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
//   }
// });

//# sourceMappingURL=service-worker.js.map





// /**
//  * Copyright 2018 Google Inc. All Rights Reserved.
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// // If the loader is already loaded, just stop.
// if (!self.define) {
//   let registry = {};

//   // Used for eval and importScripts where we can't get script URL by other means.
//   // In both cases, it's safe to use a global var because those functions are synchronous.
//   let nextDefineUri;

//   const singleRequire = (uri, parentUri) => {
//     uri = new URL(uri + ".js", parentUri).href;
//     return registry[uri] || (

//         new Promise(resolve => {
//           if ("document" in self) {
//             const script = document.createElement("script");
//             script.src = uri;
//             script.onload = resolve;
//             document.head.appendChild(script);
//           } else {
//             nextDefineUri = uri;
//             importScripts(uri);
//             resolve();
//           }
//         })

//       .then(() => {
//         let promise = registry[uri];
//         if (!promise) {
//           throw new Error(Module ${uri} didn’t register its module);
//         }
//         return promise;
//       })
//     );
//   };

//   self.define = (depsNames, factory) => {
//     const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
//     if (registry[uri]) {
//       // Module is already loading or loaded.
//       return;
//     }
//     let exports = {};
//     const require = depUri => singleRequire(depUri, uri);
//     const specialDeps = {
//       module: { uri },
//       exports,
//       require
//     };
//     registry[uri] = Promise.all(depsNames.map(
//       depName => specialDeps[depName] || require(depName)
//     )).then(deps => {
//       factory(...deps);
//       return exports;
//     });
//   };
// }
// define(['./workbox-9ed6b7fc'], (function (workbox) { 'use strict';

//   importScripts();
//   self.skipWaiting();
//   workbox.clientsClaim();
//   workbox.registerRoute("/", new workbox.NetworkFirst({
//     "cacheName": "start-url",
//     plugins: [{
//       cacheWillUpdate: async ({
//         request,
//         response,
//         event,
//         state
//       }) => {
//         if (response && response.type === 'opaqueredirect') {
//           return new Response(response.body, {
//             status: 200,
//             statusText: 'OK',
//             headers: response.headers
//           });
//         }
//         return response;
//       }
//     }]
//   }), 'GET');
//   workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
//     "cacheName": "dev",
//     plugins: []
//   }), 'GET');

// }));
// //# sourceMappingURL=service-worker.js.map


/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for eval and importScripts where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      new Promise(resolve => {
        if ("document" in self) {
          const script = document.createElement("script");
          script.src = uri;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          nextDefineUri = uri;
          importScripts(uri);
          resolve();
        }
      })
        .then(() => {
          let promise = registry[uri];
          if (!promise) {
            throw new Error(`Module ${uri} didn’t register its module`);
          }
          return promise;
        })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}

define(['./workbox-9ed6b7fc'], function (workbox) {
  'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({ request, response, event, state }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }]
  }), 'GET');

  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');

  // Push notification event listener
  self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new notification.',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      data: data.url || '/'
    };
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });

  // Notification click event listener
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.url === event.notification.data && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data);
        }
      })
    );
  });

});
//# sourceMappingURL=service-worker.js.map