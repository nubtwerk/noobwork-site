"use client";

import { useState } from "react";
import Image from "next/image";
import type { TimelineEntry } from "@/types";

export function PhotoTimeline({ entries }: { entries: TimelineEntry[] }) {
  const [compareIds, setCompareIds] = useState<[string, string] | null>(null);

  if (entries.length === 0) return null;

  const compareEntries =
    compareIds &&
    entries.filter((e) => e.photo.id === compareIds[0] || e.photo.id === compareIds[1]);

  function toggleCompare(photoId: string) {
    setCompareIds((prev) => {
      if (!prev) return [photoId, ""] as [string, string];
      if (prev[0] === photoId) return null;
      if (prev[1] === photoId) return [prev[0], ""];
      if (!prev[1]) return [prev[0], photoId];
      return [photoId, ""];
    });
  }

  return (
    <section className="plant-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display m-0 text-base uppercase tracking-tight">Photo timeline</h2>
        {entries.length >= 2 && (
          <p className="m-0 text-xs text-foreground/50">
            {compareIds?.[1]
              ? "Comparing selected"
              : compareIds?.[0]
                ? "Pick a second photo"
                : "Tap two photos to compare"}
          </p>
        )}
      </div>

      {compareEntries && compareEntries.length === 2 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {compareEntries.map((entry) => (
            <figure key={entry.photo.id} className="m-0">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                <Image
                  src={entry.photo.storagePath}
                  alt={`${entry.photo.takenAt.slice(0, 10)} check-in`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-1 text-center text-xs text-foreground/55">
                {entry.photo.takenAt.slice(0, 10)}
                {entry.analysis && (
                  <span className={`ml-1 health-${entry.analysis.overallHealth}`}>
                    · {entry.analysis.overallHealth}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {entries.map((entry) => {
          const selected =
            compareIds?.[0] === entry.photo.id || compareIds?.[1] === entry.photo.id;
          return (
            <button
              key={entry.photo.id}
              type="button"
              onClick={() => entries.length >= 2 && toggleCompare(entry.photo.id)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-surface transition ${
                selected ? "border-primary" : "border-transparent"
              } ${entries.length >= 2 ? "cursor-pointer" : "cursor-default"}`}
            >
              <Image
                src={entry.photo.storagePath}
                alt={`Check-in ${entry.photo.takenAt.slice(0, 10)}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {entry.analysis && (
                <span
                  className={`absolute bottom-0 inset-x-0 px-1 py-0.5 text-center text-[10px] font-semibold uppercase health-${entry.analysis.overallHealth} bg-white/80`}
                >
                  {entry.analysis.overallHealth.slice(0, 4)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {entries.some((e) => e.analysis) && (
        <ul className="mt-4 space-y-3 border-t border-foreground/10 pt-4">
          {entries
            .filter((e) => e.analysis)
            .slice(0, 5)
            .map((entry) => (
              <li key={entry.photo.id} className={`rounded-lg p-3 health-${entry.analysis!.overallHealth}`}>
                <p className="m-0 text-xs font-semibold uppercase text-foreground/50">
                  {entry.photo.takenAt.slice(0, 10)} · {entry.analysis!.overallHealth}
                </p>
                <p className="m-0 mt-1 text-sm">{entry.analysis!.summary}</p>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
