import { routes } from "@/config/routes";

export async function showPushNotification(title, options) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}