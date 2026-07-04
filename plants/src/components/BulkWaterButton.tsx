"use client";

import { useTransition } from "react";
import { Drop } from "@phosphor-icons/react";
import { waterAllDueAction } from "@/app/actions";

export function BulkWaterButton({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();

  if (count === 0) return null;

  return (
    <button
      type="button"
      className="btn-primary w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await waterAllDueAction();
        })
      }
    >
      <Drop size={18} weight="fill" aria-hidden />
      {pending ? "Watering…" : `Water all due (${count})`}
    </button>
  );
}
