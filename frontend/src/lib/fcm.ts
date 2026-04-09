import { getToken, onMessage } from "firebase/messaging";
import { getMessagingInstance } from "./firebase";
import { usePreferencesStore } from "@/stores/preferences";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Get a service worker registration for FCM.
 * In production: use existing Serwist registration.
 * In dev: manually register firebase-messaging-sw.js.
 */
async function getSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  // If a SW is already controlling the page, use it
  if (navigator.serviceWorker.controller) {
    return navigator.serviceWorker.ready;
  }

  // No SW active (dev mode) — register our minimal FCM SW
  try {
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-cloud-messaging-push-scope",
    });
    console.log("[FCM] Registered firebase-messaging-sw.js");
    return reg;
  } catch (e) {
    console.error("[FCM] SW registration failed:", e);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.requestPermission();
}

export async function getFcmToken(): Promise<string | null> {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn("[FCM] Messaging not supported");
    return null;
  }
  if (!VAPID_KEY) {
    console.warn("[FCM] VAPID key missing");
    return null;
  }

  try {
    const registration = await getSwRegistration();
    if (!registration) {
      console.warn("[FCM] No SW registration available");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    console.log("[FCM] Token obtained:", token?.slice(0, 20) + "...");
    return token;
  } catch (e) {
    console.error("[FCM] getToken failed:", e);
    return null;
  }
}

/**
 * Full FCM registration flow:
 * 1. Request permission
 * 2. Get FCM token
 * 3. Send to BE via preferences store
 */
export async function registerFcm(): Promise<string | null> {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.log("[FCM] Permission:", permission);
    return null;
  }

  const token = await getFcmToken();
  if (token) {
    console.log("[FCM] Sending token to BE...");
    await usePreferencesStore.getState().updateFcmToken(token);
    console.log("[FCM] Token saved to BE");
  } else {
    console.warn("[FCM] No token obtained");
  }
  return token;
}

/**
 * Listen for foreground push messages.
 * Shows an in-app notification via Sonner toast.
 */
export async function listenForegroundMessages() {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification ?? {};
    if (title) {
      import("sonner").then(({ toast }) => {
        toast.info(title, {
          description: body,
          duration: 5000,
        });
      });
    }
  });
}
