"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fetchRooms, searchSpeciesAction, updatePlantAction } from "@/app/actions";
import type { PlantWithMeta, PlantSpecies, Room } from "@/types";

export function EditPlantForm({
  plant,
  showRoomPicker = false,
}: {
  plant: PlantWithMeta;
  showRoomPicker?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState(plant.species.typeName);
  const [results, setResults] = useState<PlantSpecies[]>([]);
  const [selected, setSelected] = useState<PlantSpecies>(plant.species);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== plant.species.typeName || results.length === 0) {
        searchSpeciesAction(query).then(setResults);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, plant.species.typeName, results.length]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("plantId", plant.id);
    fd.set("speciesId", selected.id);
    setError(null);

    startTransition(async () => {
      const result = await updatePlantAction(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.push(`/plants/${plant.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
          Nickname
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          defaultValue={plant.nickname}
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="species-search" className="mb-1 block text-sm font-medium">
          Species
        </label>
        <input
          id="species-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
        {selected.id !== plant.speciesId || query !== plant.species.typeName ? (
          results.length > 0 && (
            <ul className="mt-2 max-h-48 list-none overflow-y-auto rounded-xl border border-foreground/10 bg-white/80 p-1">
              {results.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-sand/50"
                    onClick={() => {
                      setSelected(s);
                      setQuery(s.typeName);
                    }}
                  >
                    {s.typeName}
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="mt-2 text-sm text-primary">
            Current: <strong>{plant.species.typeName}</strong>
          </p>
        )}
      </div>

      {showRoomPicker && (
        <div>
          <label htmlFor="roomId" className="mb-1 block text-sm font-medium">
            Room
          </label>
          <select
            id="roomId"
            name="roomId"
            required
            defaultValue={plant.roomId}
            className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!showRoomPicker && <input type="hidden" name="roomId" value={plant.roomId} />}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="potMaterial" className="mb-1 block text-xs font-medium">
            Pot material
          </label>
          <select
            id="potMaterial"
            name="potMaterial"
            defaultValue={plant.potMaterial}
            className="w-full rounded-lg border px-2 py-2 text-sm"
          >
            <option value="plastic">Plastic</option>
            <option value="terracotta">Terracotta</option>
            <option value="ceramic">Ceramic</option>
          </select>
        </div>
        <div>
          <label htmlFor="potSize" className="mb-1 block text-xs font-medium">
            Pot size
          </label>
          <select
            id="potSize"
            name="potSize"
            defaultValue={plant.potSize}
            className="w-full rounded-lg border px-2 py-2 text-sm"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label htmlFor="lightLevel" className="mb-1 block text-xs font-medium">
            Light
          </label>
          <select
            id="lightLevel"
            name="lightLevel"
            defaultValue={plant.lightLevel}
            className="w-full rounded-lg border px-2 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="bright">Bright</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="customIntervalDays" className="mb-1 block text-sm font-medium">
          Custom water interval (days)
        </label>
        <input
          id="customIntervalDays"
          name="customIntervalDays"
          type="number"
          min={1}
          placeholder={`Auto: ~${plant.waterBreakdown.effectiveDays}`}
          defaultValue={plant.customIntervalDays ?? ""}
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-foreground/60">
          <input type="checkbox" name="clearCustomInterval" />
          Reset to auto-calculated interval
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={plant.notes ?? ""}
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-overdue" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
