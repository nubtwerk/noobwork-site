import Link from "next/link";
import { Camera, Drop } from "@phosphor-icons/react/dist/ssr";
import { formatRelativeDays, WATER_STATUS_LABEL } from "@/lib/watering";
import type { PlantWithMeta, WaterStatus } from "@/types";
import { PlantActions } from "./PlantActions";

const CHIP: Record<WaterStatus, string> = {
  overdue: "chip-overdue",
  due_today: "chip-due_today",
  upcoming: "chip-upcoming",
  on_track: "chip-on_track",
};

export function PlantCard({
  plant,
  compact = false,
  canEdit = false,
}: {
  plant: PlantWithMeta;
  compact?: boolean;
  canEdit?: boolean;
}) {
  return (
    <article className="plant-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`chip ${CHIP[plant.waterStatus]}`}>
              {WATER_STATUS_LABEL[plant.waterStatus]}
            </span>
            {plant.photoDue && (
              <span className="chip chip-photo">
                <Camera size={12} className="inline mr-1" aria-hidden />
                Photo due
              </span>
            )}
          </div>
          <h2 className="font-display m-0 truncate text-lg uppercase tracking-tight">
            <Link href={`/plants/${plant.id}`} className="text-foreground no-underline hover:text-primary">
              {plant.nickname}
            </Link>
          </h2>
          <p className="m-0 mt-1 text-sm text-foreground/70">
            {plant.species.typeName} · {plant.room.name}
          </p>
          <p className={`status-${plant.waterStatus} m-0 mt-2 flex items-center gap-1.5 text-sm font-medium`}>
            <Drop size={16} weight="fill" aria-hidden />
            {formatRelativeDays(plant.daysUntilWater)}
          </p>
        </div>
        {!compact && canEdit && <PlantActions plantId={plant.id} />}
      </div>
    </article>
  );
}
