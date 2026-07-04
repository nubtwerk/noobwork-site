"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPlantAction, fetchRooms, searchSpeciesAction } from "@/app/actions";
import type { PlantSpecies, Room } from "@/types";

export function AddPlantForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlantSpecies[]>([]);
  const [selected, setSelected] = useState<PlantSpecies | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      searchSpeciesAction(query).then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) {
      setError("Pick a species");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("speciesId", selected.id);
    setError(null);

    startTransition(async () => {
      const result = await addPlantAction(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("plantId" in result && result.plantId) {
        router.push(`/plants/${result.plantId}`);
      }
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
          placeholder="Kitchen Monstera"
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
            setSelected(null);
          }}
          placeholder="Search monstera, pothos…"
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
        {selected ? (
          <p className="mt-2 text-sm text-primary">
            Selected: <strong>{selected.typeName}</strong>
          </p>
        ) : (
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
                    <span className="block text-xs text-foreground/50">{s.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <div>
        <label htmlFor="roomId" className="mb-1 block text-sm font-medium">
          Room
        </label>
        <select
          id="roomId"
          name="roomId"
          required
          defaultValue={rooms[0]?.id}
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="potMaterial" className="mb-1 block text-xs font-medium">
            Pot material
          </label>
          <select id="potMaterial" name="potMaterial" className="w-full rounded-lg border px-2 py-2 text-sm">
            <option value="plastic">Plastic</option>
            <option value="terracotta">Terracotta</option>
            <option value="ceramic">Ceramic</option>
          </select>
        </div>
        <div>
          <label htmlFor="potSize" className="mb-1 block text-xs font-medium">
            Pot size
          </label>
          <select id="potSize" name="potSize" className="w-full rounded-lg border px-2 py-2 text-sm">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label htmlFor="lightLevel" className="mb-1 block text-xs font-medium">
            Light
          </label>
          <select id="lightLevel" name="lightLevel" className="w-full rounded-lg border px-2 py-2 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="bright">Bright</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-overdue" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending || !selected}>
        {pending ? "Adding…" : "Add plant"}
      </button>
    </form>
  );
}
