import type { WaterIntervalBreakdown } from "@/types";

export function WaterExplain({ breakdown }: { breakdown: WaterIntervalBreakdown }) {
  return (
    <section className="plant-card p-5">
      <h2 className="font-display m-0 text-base uppercase tracking-tight">Why this schedule?</h2>
      <p className="m-0 mt-2 text-sm leading-relaxed text-foreground/80">{breakdown.summary}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/50">{breakdown.season} baseline</dt>
          <dd className="m-0 font-medium">{breakdown.baseDays} days</dd>
        </div>
        {breakdown.factors.slice(1).map((f) => (
          <div key={f.label} className="flex justify-between gap-4">
            <dt className="text-foreground/50 capitalize">{f.label}</dt>
            <dd className="m-0 font-medium">×{f.multiplier.toFixed(2)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-foreground/10 pt-2">
          <dt className="font-medium">Effective interval</dt>
          <dd className="m-0 font-display text-lg uppercase tracking-tight text-primary">
            ~{breakdown.effectiveDays} days
          </dd>
        </div>
      </dl>
    </section>
  );
}
