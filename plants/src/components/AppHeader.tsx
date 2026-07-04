import Link from "next/link";
import { Plus, SignIn, SignOut } from "@phosphor-icons/react/dist/ssr";
import { canEdit } from "@/lib/auth";

export async function AppHeader() {
  const isEditor = await canEdit();

  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="group flex items-center gap-2 no-underline">
        <LeafIcon />
        <div>
          <p className="font-display m-0 text-lg uppercase tracking-tight text-primary">
            Plants
          </p>
          <p className="m-0 text-xs text-foreground/60">noobwork · home</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {isEditor ? (
          <>
            <Link href="/plants/new" className="btn-primary no-underline">
              <Plus size={18} weight="bold" aria-hidden />
              Add
            </Link>
            <Link
              href="/api/auth/logout"
              className="btn-secondary no-underline"
              title="Sign out"
            >
              <SignOut size={18} aria-hidden />
              <span className="sr-only">Sign out</span>
            </Link>
          </>
        ) : (
          <Link href="/login" className="btn-secondary no-underline">
            <SignIn size={18} aria-hidden />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function LeafIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 256 256"
      fill="currentColor"
      className="text-primary"
      aria-hidden
    >
      <path d="M224,48c0,114.9-94.3,176-94.3,176S32,162.9,32,48a8,8,0,0,1,8-8c48.6,0,83.3,21.9,83.3,21.9S158.3,40,206.9,40A8,8,0,0,1,224,48Z" />
    </svg>
  );
}
