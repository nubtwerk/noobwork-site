"use client";

import { useEffect, useState } from "react";
import { Bell, BellSlash } from "@phosphor-icons/react";
import { subscribePushAction, unsubscribePushAction } from "@/app/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushSubscribe({ vapidPublicKey }: { vapidPublicKey?: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (!vapidPublicKey || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setSubscribed(true);
        setEndpoint(sub.endpoint);
      }
    });
  }, [vapidPublicKey]);

  if (!vapidPublicKey) return null;

  async function subscribe() {
    if (!vapidPublicKey) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = sub.toJSON();
      await subscribePushAction({
        endpoint: sub.endpoint,
        keys: {
          p256dh: json.keys!.p256dh!,
          auth: json.keys!.auth!,
        },
      });
      setSubscribed(true);
      setEndpoint(sub.endpoint);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    if (!endpoint) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await unsubscribePushAction(endpoint);
      setSubscribed(false);
      setEndpoint(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="plant-card p-4">
      <p className="m-0 text-sm font-medium">Morning reminders</p>
      <p className="m-0 mt-1 text-xs text-foreground/55">
        Get a push notification when plants need water or a photo check-in.
      </p>
      <button
        type="button"
        className="btn-secondary mt-3 w-full"
        disabled={loading}
        onClick={subscribed ? unsubscribe : subscribe}
      >
        {subscribed ? (
          <>
            <BellSlash size={18} aria-hidden />
            Unsubscribe
          </>
        ) : (
          <>
            <Bell size={18} aria-hidden />
            {loading ? "Enabling…" : "Enable push reminders"}
          </>
        )}
      </button>
    </div>
  );
}
