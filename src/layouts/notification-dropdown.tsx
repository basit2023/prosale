'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
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

dayjs.extend(relativeTime);

const defaultData = [
  // Same default data as before, if needed
];

async function fetchNotifications(email) {
  try {
    const response = await apiService.get(`/getNotification/${email}`);
    console.log("the email:", response);
    console.log("the data is:", response?.data?.results);
    const data = await response?.data?.results;
    if (response) {
      return data;
    } else {
      console.error(response.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

async function markAsRead(notificationId) {
  try {
    const response = await apiService.put(`/markNotificationAsRead/${notificationId}`);
    console.log("Marked as read:", response);
    return response?.data?.success;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

function NotificationsList({
  notifications,
  setIsOpen,
  setNotifications,
}) {
  const handleNotificationClick = async (notification) => {
    console.log("the notification is:", notification)
    if (notification.notification_mark === 0) {
      const success = await markAsRead(notification.id);
      if (success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((item) =>
            item.id === notification.id ? { ...item, notification_mark: 1 } : item
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
          {notifications?.map((item) => (
            <Link key={item.id} href={routes.leads.edit(item.leadId)} onClick={() => handleNotificationClick(item)}>
              <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                  {item.icon}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <div className="w-full">
                    <Title
                      as="h6"
                      className="mb-0.5 w-11/12 truncate text-sm font-semibold"
                    >
                      Lead assigned on {dayjs(item.created_at).format('dddd, MMMM D, YYYY')}
                    </Title>
                    <span className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">
                      {dayjs(item.created_at).fromNow(true)}
                    </span>
                  </div>
                  <div className="ms-auto flex-shrink-0">
                    {item.notification_mark === 0 ? (
                      <Badge
                        renderAsDot
                        size="lg"
                        color="primary"
                        className="scale-90"
                      />
                    ) : (
                      <PiCheck className="h-auto w-[9px]" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
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

export default function NotificationDropdown({
  children,
}) {
  const { data: session } = useSession();
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultData);
  const [unreadCount, setUnreadCount] = useState(0);
  const email = session?.user?.email;
  
  useEffect(() => {
    if (email) {
      fetchNotifications(email).then((data) => {
        // Sort notifications from latest to oldest
        const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(sortedNotifications);
        const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
        setUnreadCount(unread);
      });
    }
  }, [email]);

  useEffect(() => {
    if (isOpen && email) {
      fetchNotifications(email).then((data) => {
        // Sort notifications from latest to oldest
        const sortedNotifications = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(sortedNotifications);
        const unread = sortedNotifications.filter(notification => notification.notification_mark === 0).length;
        setUnreadCount(unread);
      });
    }
  }, [isOpen, email]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={() => <NotificationsList notifications={notifications} setIsOpen={setIsOpen} setNotifications={setNotifications} />}
      shadow="sm"
      placement={isMobile ? 'bottom' : 'bottom-end'}
      className="z-50 px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex"
    >
      {children(unreadCount)}
    </Popover>
  );
}
