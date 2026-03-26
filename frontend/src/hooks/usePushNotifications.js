import { useEffect } from 'react';
import useUserStore from '../store/userStore';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const userInfo = useUserStore(state => state.userInfo);

  useEffect(() => {
    const subscribeToPush = async () => {
      // Feature detect
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      if (!userInfo || !userInfo.token) return; // Only for logged-in users
      if (Notification.permission === 'denied') return; // Don't ask again if denied

      try {
        // Only ask if default (not already granted)
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        // Wait for SW to be ready
        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const res = await fetch('/api/notifications/vapidPublicKey');
          if (!res.ok) throw new Error('Could not fetch vapid key');
          const publicKey = await res.text();
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });
        }

        // Send subscription object to backend to store against user
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`
          },
          body: JSON.stringify(subscription)
        });
        
      } catch (err) {
        console.error('Push registration failed:', err);
      }
    };

    subscribeToPush();
  }, [userInfo]);
};
