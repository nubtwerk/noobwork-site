import { CloudSun } from "@phosphor-icons/react/dist/ssr";
import type { SeoulWeatherNudge } from "@/types";

export function WeatherNudge({ nudge }: { nudge: SeoulWeatherNudge }) {
  return (
    <aside className="plant-card flex gap-3 p-4">
      <CloudSun size={28} weight="duotone" className="shrink-0 text-primary" aria-hidden />
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Seoul today · {Math.round(nudge.humidity)}% humidity · {Math.round(nudge.temperature)}°C
        </p>
        <p className="m-0 mt-1 text-sm leading-relaxed text-foreground/80">{nudge.message}</p>
        {nudge.intervalAdjustDays !== 0 && (
          <p className="m-0 mt-2 text-xs text-foreground/55">
            Suggested adjustment: {nudge.intervalAdjustDays > 0 ? "+" : ""}
            {nudge.intervalAdjustDays} day on watering intervals
          </p>
        )}
      </div>
    </aside>
  );
}
