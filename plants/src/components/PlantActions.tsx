"use client";

import { useTransition } from "react";
import { Drop, Timer } from "@phosphor-icons/react";
import { snoozePlantAction, waterPlantAction } from "@/app/actions";

export function PlantActions({ plantId }: { plantId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await waterPlantAction(plantId);
          })
        }
      >
        <Drop size={16} weight="fill" aria-hidden />
        Water
      </button>
      <button
        type="button"
        className="btn-secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await snoozePlantAction(plantId);
          })
        }
      >
        <Timer size={16} aria-hidden />
        Snooze
      </button>
    </div>
  );
}
