import type { CollectionStats } from "@/types";

export function CollectionStatsBar({ stats }: { stats: CollectionStats }) {
  if (stats.totalPlants === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Plants" value={stats.totalPlants} />
      <Stat label="Need water" value={stats.needWater} highlight={stats.needWater > 0} />
      <Stat label="Photo due" value={stats.photoDue} highlight={stats.photoDue > 0} />
      <Stat
        label="Last check-in"
        value={
          stats.lastCheckInDaysAgo === null
            ? "—"
            : stats.lastCheckInDaysAgo === 0
              ? "Today"
              : `${stats.lastCheckInDaysAgo}d ago`
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="plant-card px-4 py-3 text-center">
      <p className="m-0 text-xs uppercase tracking-wide text-foreground/50">{label}</p>
      <p
        className={`font-display m-0 mt-1 text-2xl uppercase tracking-tight ${highlight ? "text-overdue" : "text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}
