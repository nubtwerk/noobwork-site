"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Spinner } from "@phosphor-icons/react";
import { scheduleFollowUpAction, uploadPhotoAction } from "@/app/actions";
import type { PhotoAnalysis } from "@/types";

export function PhotoUpload({
  plantId,
  photoDue,
}: {
  plantId: string;
  photoDue: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpScheduled, setFollowUpScheduled] = useState(false);

  function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setFollowUpScheduled(false);
    const fd = new FormData();
    fd.set("plantId", plantId);
    fd.set("photo", file);
    fd.set("promptType", photoDue ? "scheduled" : "manual");

    startTransition(async () => {
      const result = await uploadPhotoAction(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("analysis" in result && result.analysis) {
        setAnalysis(result.analysis);
      }
    });
  }

  function scheduleFollowUp(days: number) {
    startTransition(async () => {
      await scheduleFollowUpAction(plantId, days);
      setFollowUpScheduled(true);
    });
  }

  return (
    <section className="plant-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display m-0 text-base uppercase tracking-tight">Photo check-in</h2>
          <p className="m-0 mt-1 text-sm text-foreground/65">
            {photoDue
              ? "A new photo helps track growth and spot issues early."
              : "Upload anytime for a condition snapshot."}
          </p>
        </div>
        {photoDue && <span className="chip chip-photo">Due</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className="btn-primary w-full"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? (
          <Spinner size={18} className="animate-spin" aria-hidden />
        ) : (
          <Camera size={18} weight="duotone" aria-hidden />
        )}
        {pending ? "Analyzing…" : "Take or upload photo"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-overdue" role="alert">
          {error}
        </p>
      )}

      {analysis && (
        <div className={`mt-4 rounded-xl bg-surface/80 p-4 health-${analysis.overallHealth}`}>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-foreground/55">
            {analysis.overallHealth} · {Math.round(analysis.confidence * 100)}% confidence
          </p>
          <p className="m-0 mt-2 text-sm leading-relaxed">{analysis.summary}</p>
          {analysis.findings.length > 0 && (
            <ul className="mt-3 space-y-2 pl-4 text-sm">
              {analysis.findings.map((f, i) => (
                <li key={i}>
                  <strong>{f.type}</strong> ({f.severity}): {f.description}
                  <span className="block text-foreground/70">{f.action}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="m-0 mt-3 text-xs text-foreground/55">
            Watering: {analysis.wateringAssessment.replace("_", " ")} · Light: {analysis.lightAssessment}
          </p>

          {analysis.overallHealth === "concerning" && !followUpScheduled && (
            <div className="mt-4 rounded-lg border border-overdue/20 bg-white/60 p-3">
              <p className="m-0 text-sm font-medium">Schedule a follow-up check?</p>
              <p className="m-0 mt-1 text-xs text-foreground/60">
                Recommended in {analysis.followUpDays} days based on this analysis.
              </p>
              <button
                type="button"
                className="btn-secondary mt-3 w-full"
                disabled={pending}
                onClick={() => scheduleFollowUp(analysis.followUpDays)}
              >
                Remind me in {analysis.followUpDays} days
              </button>
            </div>
          )}

          {followUpScheduled && (
            <p className="m-0 mt-3 text-sm text-primary">Follow-up photo scheduled.</p>
          )}
        </div>
      )}
    </section>
  );
}
