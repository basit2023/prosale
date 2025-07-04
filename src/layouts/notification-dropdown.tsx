'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Popover } from '@/components/ui/popover';
import { Title } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PiCheck } from 'react-icons/pi'; 
import apiService from '@/utils/apiService';
import SimpleBar from '@/components/ui/simplebar'; 
import Link from 'next/link';    
import { useMedia } from '@/hooks/use-media';
import { routes } from '@/config/routes';
import { subscribeUser, showPushNotification  }from '@/app/pushService';
// Extend dayjs with required pluginsff
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone (adjust to your server's timezone)
dayjs.tz.setDefault('Asia/Karachi'); // Change this to your server's timezone

// WebSocket Hook
const useWebSocket = (url, onMessage) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, [url, onMessage]);

  return ws;
};

// Fetch Notifications
async function fetchNotifications(email) {
  try {
    const response = await apiService.get(`/getNotification/${email}`);
    const data = response?.data?.results || [];
    return data.map(notification => ({
      ...notification,
      // Parse the timestamp to ensure it's in correct format
      created_at: parseTimestamp(notification.created_at)
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Helper function to parse and normalize timestamps
function parseTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  // If timestamp is already in ISO format, return as-is
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    return timestamp;
  }
  
  // If it's a MySQL datetime string, convert to ISO format
  if (typeof timestamp === 'string' && timestamp.includes(' ')) {
    return dayjs.tz(timestamp, 'Asia/Karachi').toISOString(); // Use your server timezone
  }
  
  // Fallback to current time
  return new Date().toISOString();
}

async function markAsRead(notification) {
  try {
    const response = await apiService.put(
      `/markNotificationAsRead/${notification.id}?leadId=${notification.leadId}`
    );
    return response?.data?.success;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

function NotificationsList({ notifications, setIsOpen, setNotifications }) {
  const handleNotificationClick = async (notification) => {
    if (notification.notification_mark === 0) {
      const success = await markAsRead(notification);
      if (success) {
        setNotifications(prev =>
          prev.map(item =>
            item.id === notification.id 
              ? { ...item, notification_mark: 1 } 
              : item
          )
        );
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="w-[320px] text-left rtl:text-right sm:w-[360px] 2xl:w-[420px]">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5">Notifications</Title>
        <Checkbox label="Mark All As Read" />
      </div>
      <SimpleBar className="max-h-[420px]">
        <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
          {notifications?.map((item) => {
            // Parse the timestamp with timezone awareness
            const createdAt = dayjs(item.created_at);
            const formattedDate = createdAt.format('dddd, MMMM D, YYYY');
            const timeAgo = createdAt.fromNow(true);
            
            return (
              <Link 
                key={item.id} 
                href={routes.leads.edit(item.leadId)} 
                onClick={() => handleNotificationClick(item)}
              >
                <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                    {item.icon}
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                    <div className="w-full">
                      <Title as="h6" className="mb-0.5 w-11/12 truncate text-sm font-semibold">
                        Lead assigned on {formattedDate}
                      </Title>
                      <span className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
                        {timeAgo}
                      </span>
                    </div>
                    <div className="ms-auto flex-shrink-0">
                      {item.notification_mark === 0 ? (
                        <Badge renderAsDot size="lg" color="primary" className="scale-90" />
                      ) : (
                        <PiCheck className="h-auto w-[9px]" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </SimpleBar>
      <Link
        href={'#'}
        onClick={() => setIsOpen(false)}
        className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
      >
        View All Activity
      </Link>
    </div>
  );
}

export default function NotificationDropdown({ children }) {
  const { data: session } = useSession();
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const email = session?.user?.email;
  const userId = session?.user?.id;

  // WebSocket URL configuration
 const websocketUrl = useMemo(() => {
  return window.location.protocol === 'https:' 
    ? 'wss://api.prosale.sale:8443' 
    : 'ws://localhost:4001';
}, []);


  // WebSocket message handler
const handleWebSocketMessage = useCallback(async (message) => {
  if (!userId) return;

  const { event, data } = message;
  const { userId: messageUserId, leadId, created_at } = data || {};

  // Only process notifications for the current user
  if (parseInt(messageUserId) === parseInt(userId)) {
    if (event === 'lead_assigned') {
      const newNotification = {
        id: Date.now(),
        leadId,
        message: data.message,
        created_at: parseTimestamp(created_at),
        notification_mark: 0,
        userId: messageUserId,
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        setUnreadCount(updated.filter(n => n.notification_mark === 0).length);
        return updated;
      });

      // Trigger push notification
      try {
        await showPushNotification('New Lead Assigned', {
          body: `You have been assigned a new lead (ID: ${leadId})`,
          icon: '/path-to-your-icon.png',
          vibrate: [200, 100, 200],
          data: {
            url: `${window.location.origin}${routes.leads.edit(leadId)}`
          }
        });
      } catch (error) {
        console.error('Error showing push notification:', error);
      }
    } 
    else if (event === 'lead_reassigned') {
      setNotifications(prev => {
        const updated = prev.filter(n => n.leadId !== leadId);
        setUnreadCount(updated.filter(n => n.notification_mark === 0).length);
        return updated;
      });
    }
  }
}, [userId]);

  // WebSocket connection
  const ws = useWebSocket(websocketUrl, handleWebSocketMessage);

  // Initial fetch and refresh when dropdown opens
  const fetchAndSetNotifications = useCallback(async () => {
    if (!email) return;
    
    try {
      const data = await fetchNotifications(email);
      const sorted = data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => n.notification_mark === 0).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [email]);

  useEffect(() => {
    fetchAndSetNotifications();
  }, [fetchAndSetNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchAndSetNotifications();
    }
  }, [isOpen, fetchAndSetNotifications]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={() => (
        <NotificationsList 
          notifications={notifications} 
          setIsOpen={setIsOpen} 
          setNotifications={setNotifications} 
        />
      )}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
      className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
    >
      {children(unreadCount)}
    </Popover>
  );
}








 // send the leads but also send notification to all users

// 'use client';
// import { useSession } from 'next-auth/react';
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import * as dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import { Popover } from '@/components/ui/popover';
// import { Title } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { PiCheck } from 'react-icons/pi';
// import apiService from '@/utils/apiService';
// import SimpleBar from '@/components/ui/simplebar';
// import Link from 'next/link';
// import { useMedia } from '@/hooks/use-media';
// import { routes } from '@/config/routes';

// dayjs.extend(relativeTime);

// // WebSocket Hook
// const useWebSocket = (url, onMessage) => {
//   const [ws, setWs] = useState(null);

//   useEffect(() => {
//     const websocket = new WebSocket(url);

//     websocket.onopen = () => {
//       console.log('WebSocket connected');
//       setWs(websocket);
//     };

//     websocket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       onMessage(message);
//     };

//     websocket.onclose = () => {
//       console.log('WebSocket disconnected');
//       setWs(null);
//     };

//     // Cleanup function to close WebSocket on unmount
//     return () => {
//       websocket.close();
//     };
//   }, [url, onMessage]); // Reconnect only if URL or onMessage changes

//   return ws;
// };

// // Fetch Notifications
// async function fetchNotifications(email) {
//   try {
//     const response = await apiService.get(`/getNotification/${email}`);
//     const data = response?.data?.results;
//     if (response) {
//       return data;
//     } else {
//       console.error(response.message);
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return [];
//   }
// }

// // Mark Notification as Read
// async function markAsRead(notificationId) {
//   try {
//     const response = await apiService.put(`/markNotificationAsRead/${notificationId}`);
//     return response?.data?.success;
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return false;
//   }
// }

// // Notifications List Component
// function NotificationsList({ notifications, setIsOpen, setNotifications }) {
//   const handleNotificationClick = async (notification) => {
//     if (notification.notification_mark === 0) {
//       const success = await markAsRead(notification.id);
//       if (success) {
//         setNotifications((prevNotifications) =>
//           prevNotifications.map((item) =>
//             item.id === notification.id ? { ...item, notification_mark: 1 } : item
//           )
//         );
//       }
//     }
//     setIsOpen(false);
//   };

//   return (
//     <div className="w-[320px] text-left rtl:text-right sm:w-[360px] 2xl:w-[420px]">
//       <div className="mb-3 flex items-center justify-between ps-6">
//         <Title as="h5">Notifications</Title>
//         <Checkbox label="Mark All As Read" />
//       </div>
//       <SimpleBar className="max-h-[420px]">
//         <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
//           {notifications?.map((item) => (
//             <Link key={item.id} href={routes.leads.edit(item.leadId)} onClick={() => handleNotificationClick(item)}>
//               <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
//                 <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
//                   {item.icon}
//                 </div>
//                 <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
//                   <div className="w-full">
//                     <Title
//                       as="h6"
//                       className="mb-0.5 w-11/12 truncate text-sm font-semibold"
//                     >
//                       {item.message || `Lead assigned on ${dayjs(item.created_at).format('dddd, MMMM D, YYYY')}`}
//                     </Title>
//                     <span className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
//                       {dayjs(item.created_at).fromNow(true)}
//                     </span>
//                   </div>
//                   <div className="ms-auto flex-shrink-0">
//                     {item.notification_mark === 0 ? (
//                       <Badge
//                         renderAsDot
//                         size="lg"
//                         color="primary"
//                         className="scale-90"
//                       />
//                     ) : (
//                       <PiCheck className="h-auto w-[9px]" />
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </SimpleBar>
//       <Link
//         href={'#'}
//         onClick={() => setIsOpen(false)}
//         className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
//       >
//         View All Activity
//       </Link>
//     </div>
//   );
// }

// export default function NotificationDropdown({ children }) {
//   const { data: session } = useSession();
//   const isMobile = useMedia('(max-width: 480px)', false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const email = session?.user?.email;
//   const userId = session?.user?.id; // Assuming the user ID is available in the session

//   // Memoize the WebSocket URL to prevent unnecessary reconnections
//   const websocketUrl = useMemo(() => 'ws://localhost:4001', []);

//   // Memoize the onMessage handler to prevent unnecessary re-renders
//   const handleWebSocketMessage = useCallback((message) => {
//     console.log("The message from the backend is:", message);

//     // Ensure the message is intended for the current user
//     if (message.data.userId === userId) {
//       if (message.event === 'lead_assigned' || message.event === 'lead_reassigned') {
//         const newNotification = {
//           id: Date.now(), // Use a unique ID
//           leadId: message.data.leadId,
//           message: message.data.message,
//           created_at: new Date().toISOString(),
//           notification_mark: 0,
//         };

//         setNotifications((prevNotifications) => {
//           const updatedNotifications = [newNotification, ...prevNotifications];
//           const unread = updatedNotifications.filter(notification => notification.notification_mark === 0).length;
//           setUnreadCount(unread);
//           return updatedNotifications;
//         });
//       }
//     }
//   }, [userId]);

//   // WebSocket Connection
//   const ws = useWebSocket(websocketUrl, handleWebSocketMessage);

//   // Fetch Notifications on Component Mount
//   useEffect(() => {
//     if (email) {
//       fetchNotifications(email).then((data) => {
//         const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setNotifications(sortedNotifications);
//         const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
//         setUnreadCount(unread);
//       });
//     }
//   }, [email]);

//   // Fetch Notifications When Dropdown is Opened
//   useEffect(() => {
//     if (isOpen && email) {
//       fetchNotifications(email).then((data) => {
//         const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setNotifications(sortedNotifications);
//         const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
//         setUnreadCount(unread);
//       });
//     }
//   }, [isOpen, email]);

//   return (
//     <Popover
//       isOpen={isOpen}
//       setIsOpen={setIsOpen}
//       content={() => <NotificationsList notifications={notifications} setIsOpen={setIsOpen} setNotifications={setNotifications} />}
//       shadow="sm"
//       placement={isMobile ? 'bottom' : 'bottom-end'}
//       className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
//     >
//       {children(unreadCount)}
//     </Popover>
//   );
// }


//ok one


// 'use client';
// import { useSession } from 'next-auth/react';
// import { useState, useEffect } from 'react';
// import * as dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import { Popover } from '@/components/ui/popover';
// import { Title } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { PiCheck } from 'react-icons/pi';
// import apiService from '@/utils/apiService';
// import SimpleBar from '@/components/ui/simplebar';
// import Link from 'next/link';
// import { useMedia } from '@/hooks/use-media';
// import { routes } from '@/config/routes';

// dayjs.extend(relativeTime);

// const defaultData = [
//   // Same default data as before, if needed
// ];

// async function fetchNotifications(email) {
//   try {
//     const response = await apiService.get(`/getNotification/${email}`);
//     console.log("the email:", response);
//     console.log("the data is:", response?.data?.results);
//     const data = await response?.data?.results;
//     if (response) {
//       return data;
//     } else {
//       console.error(response.message);
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return [];
//   }
// }

// async function markAsRead(notificationId) {
//   try {
//     const response = await apiService.put(`/markNotificationAsRead/${notificationId}`);
//     console.log("Marked as read:", response);
//     return response?.data?.success;
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return false;
//   }
// }

// function NotificationsList({
//   notifications,
//   setIsOpen,
//   setNotifications,
// }) {
//   const handleNotificationClick = async (notification) => {
//     console.log("the notification is:", notification)
//     if (notification.notification_mark === 0) {
//       const success = await markAsRead(notification.id);
//       if (success) {
//         setNotifications((prevNotifications) =>
//           prevNotifications.map((item) =>
//             item.id === notification.id ? { ...item, notification_mark: 1 } : item
//           )
//         );
//       }
//     }
//     setIsOpen(false);
//   };

//   return (
//     <div className="w-[320px] text-left rtl:text-right sm:w-[360px] 2xl:w-[420px]">
//       <div className="mb-3 flex items-center justify-between ps-6">
//         <Title as="h5">Notifications</Title>
//         <Checkbox label="Mark All As Read" />
//       </div>
//       <SimpleBar className="max-h-[420px]">
//         <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
//           {notifications?.map((item) => (
//             <Link key={item.id} href={routes.leads.edit(item.leadId)} onClick={() => handleNotificationClick(item)}>
//               <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
//                 <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
//                   {item.icon}
//                 </div>
//                 <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
//                   <div className="w-full">
//                     <Title
//                       as="h6"
//                       className="mb-0.5 w-11/12 truncate text-sm font-semibold"
//                     >
//                       Lead assigned on {dayjs(item.created_at).format('dddd, MMMM D, YYYY')}
//                     </Title>
//                     <span className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
//                       {dayjs(item.created_at).fromNow(true)}
//                     </span>
//                   </div>
//                   <div className="ms-auto flex-shrink-0">
//                     {item.notification_mark === 0 ? (
//                       <Badge
//                         renderAsDot
//                         size="lg"
//                         color="primary"
//                         className="scale-90"
//                       />
//                     ) : (
//                       <PiCheck className="h-auto w-[9px]" />
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </SimpleBar>
//       <Link
//         href={'#'}
//         onClick={() => setIsOpen(false)}
//         className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline"
//       >
//         View All Activity
//       </Link>
//     </div>
//   );
// }

// export default function NotificationDropdown({
//   children,
// }) {
//   const { data: session } = useSession();
//   const isMobile = useMedia('(max-width: 480px)', false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [notifications, setNotifications] = useState(defaultData);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const email = session?.user?.email;
  
//   useEffect(() => {
//     if (email) {
//       fetchNotifications(email).then((data) => {
//         // Sort notifications from latest to oldest
//         const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setNotifications(sortedNotifications);
//         const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
//         setUnreadCount(unread);
//       });
//     }
//   }, [email]);

//   useEffect(() => {
//     if (isOpen && email) {
//       fetchNotifications(email).then((data) => {
//         // Sort notifications from latest to oldest
//         const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setNotifications(sortedNotifications);
//         const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
//         setUnreadCount(unread);
//       });
//     }
//   }, [isOpen, email]);

//   return (
//     <Popover
//       isOpen={isOpen}
//       setIsOpen={setIsOpen}
//       content={() => <NotificationsList notifications={notifications} setIsOpen={setIsOpen} setNotifications={setNotifications} />}
//       shadow="sm"
//       placement={isMobile ? 'bottom' : 'bottom-end'}
//       className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
//     >
//       {children(unreadCount)}
//     </Popover>
//   );
// }







// 'use client';
// import { useSession } from 'next-auth/react';
// import { useState, useEffect } from 'react';
// import * as dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import { Popover } from '@/components/ui/popover';
// import { Title } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { PiCheck } from 'react-icons/pi';
// import apiService from '@/utils/apiService';
// import SimpleBar from '@/components/ui/simplebar';
// import Link from 'next/link';
// import { useMedia } from '@/hooks/use-media';
// import { routes } from '@/config/routes';

// dayjs.extend(relativeTime);

// async function fetchNotifications(userName) {
//   try {
//     const response = await apiService.get(`/getNotification/${userName}`);
//     return response?.data?.results || [];
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return [];
//   }
// }

// async function markAsRead(notificationId) {
//   try {
//     const response = await apiService.put(`/markNotificationAsRead/${notificationId}`);
//     return response?.data?.success;
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return false;
//   }
// }

// function NotificationsList({ notifications, setIsOpen, setNotifications }) {
//   const handleNotificationClick = async (notification) => {
//     if (notification.notification_mark === 0) {
//       const success = await markAsRead(notification.id);
//       if (success) {
//         setNotifications((prevNotifications) =>
//           prevNotifications.filter((item) => item.id !== notification.id)
//         );
//       }
//     }
//     setIsOpen(false);
//   };

//   return (
//     <div className="w-[320px] sm:w-[360px] 2xl:w-[420px]">
//       <div className="mb-3 flex items-center justify-between ps-6">
//         <Title as="h5">Notifications</Title>
//         <Checkbox 
//           label="Mark All As Read" 
//           onClick={() => setNotifications([])}
//         />
//       </div>
//       <SimpleBar className="max-h-[420px]">
//         <div className="grid grid-cols-1 gap-1 ps-4">
//           {notifications?.map((item) => (
//             <Link key={item.id} href={routes.leads.edit(item.leadId)} onClick={(e) => {
//               e.preventDefault();
//               handleNotificationClick(item);
//             }}>
//               <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
//                 <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100 p-1 dark:bg-gray-50">
//                   {item.icon}
//                 </div>
//                 <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
//                   <div className="w-full">
//                     <Title as="h6" className="mb-0.5 w-11/12 truncate text-sm font-semibold">
//                       Lead assigned on {dayjs(item.created_at).format('dddd, MMMM D, YYYY')}
//                     </Title>
//                     <span className="ms-auto text-xs text-gray-500">
//                       {dayjs(item.created_at).fromNow(true)}
//                     </span>
//                   </div>
//                   <div className="ms-auto">
//                     {item.notification_mark === 0 ? <Badge renderAsDot size="lg" color="primary" /> : <PiCheck className="w-[9px]" />}
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </SimpleBar>
//     </div>
//   );
// }

// export default function NotificationDropdown({ children }) {
//   const { data: session } = useSession();
//   const isMobile = useMedia('(max-width: 480px)', false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const userName = session?.user?.name;

//   useEffect(() => {
//     if (Notification.permission !== 'granted') {
//       Notification.requestPermission();
//     }
//   }, []);

//   useEffect(() => {
//     if (userName) {
//       fetchNotifications(userName).then((data) => {
//         setNotifications(data);
//         setUnreadCount(data.filter((n) => n.notification_mark === 0).length);
//       });
//     }
//   }, [userName]);

//   useEffect(() => {
//     const socket = new WebSocket('ws://localhost:4001');

//     socket.onopen = () => console.log('WebSocket connected');

//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('WebSocket message received:', data);

//         if (data.event === 'lead_assigned' && data.data.userName === userName) {
//           const newNotification = {
//             id: data.data.notificationId,
//             leadId: data.data.leadId,
//             created_at: new Date().toISOString(),
//             notification_mark: 0,
//             message: data.data.message,
//           };

//           setNotifications((prev) => [newNotification, ...prev]);
//           setUnreadCount((prev) => prev + 1);
//         }
        
//         if (data.event === 'lead_reassigned' && data.data.userName === userName) {
//           setNotifications((prev) => prev.filter((item) => item.leadId !== data.data.leadId));
//           setUnreadCount((prev) => prev - 1);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     socket.onclose = () => console.log('WebSocket disconnected');

//     return () => socket.close();
//   }, [userName]);

//   return (
//     <Popover
//       isOpen={isOpen}
//       setIsOpen={setIsOpen}
//       content={() => <NotificationsList notifications={notifications} setIsOpen={setIsOpen} setNotifications={setNotifications} />}
//       shadow="sm"
//       placement={isMobile ? 'bottom' : 'bottom-end'}
//       className="z-50 px-0 pb-4 pt-5 dark:bg-gray-100 sm:[&>svg]:inline-flex"
//     >
//       {children(unreadCount)}
//     </Popover>
//   );
// }
