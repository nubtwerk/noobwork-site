import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/plants/new";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display m-0 text-3xl uppercase tracking-tight text-primary">
          Sign in
        </h1>
        <p className="m-0 mt-2 text-sm text-foreground/65 leading-relaxed">
          The collection is public to view. Sign in with your owner email to add plants,
          log watering, and upload photo check-ins.
        </p>
      </div>

      {params.error === "invalid_token" && (
        <p className="text-sm text-overdue" role="alert">
          That sign-in link expired or is invalid. Request a new one.
        </p>
      )}

      <LoginForm nextPath={nextPath} />

      <p className="text-center text-sm">
        <Link href="/" className="text-foreground/60 no-underline hover:text-primary">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
