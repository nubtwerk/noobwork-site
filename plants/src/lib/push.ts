import webpush from "web-push";
import type { PushSubscriptionRecord } from "@/types";

function configureWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:joachim@noobwork.no";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export function pushEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function sendPushToAll(
  subscriptions: PushSubscriptionRecord[],
  payload: { title: string; body: string; url?: string },
): Promise<{ sent: number; failed: number }> {
  if (!configureWebPush() || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const message = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
        );
        sent++;
      } catch {
        failed++;
      }
    }),
  );

  return { sent, failed };
}
