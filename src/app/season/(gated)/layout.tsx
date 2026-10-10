import { Suspense } from "react";
import { cookies } from "next/headers";
import SeasonUnlockForm from "@/components/ui/SeasonUnlockForm";
import { PAGE_COOKIE, pagePasswordConfigured, verifyPageSession } from "@/lib/season-page-auth";

export const dynamic = "force-dynamic";

export default async function SeasonGatedLayout({ children }: { children: React.ReactNode }) {
  const unlocked = verifyPageSession((await cookies()).get(PAGE_COOKIE)?.value);
  if (unlocked) return children;

  return (
    <Suspense fallback={<main id="main-content" className="season-admin" aria-busy="true" />}>
      <SeasonUnlockForm configured={pagePasswordConfigured()} />
    </Suspense>
  );
}
