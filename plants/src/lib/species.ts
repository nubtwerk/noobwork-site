import houseplants from "@/data/species-houseplants.json";
import customSpecies from "@/data/species-custom.json";
import type { PlantSpecies } from "@/types";

const species = [...(houseplants as PlantSpecies[]), ...(customSpecies as PlantSpecies[])];

export function getAllSpecies(): PlantSpecies[] {
  return species;
}

export function getSpeciesById(id: string): PlantSpecies | undefined {
  return species.find((s) => s.id === id);
}

export function searchSpecies(query: string, limit = 12): PlantSpecies[] {
  const q = query.trim().toLowerCase();
  if (!q) return species.slice(0, limit);

  return species
    .filter(
      (s) =>
        s.typeName.toLowerCase().includes(q) ||
        s.commonExamples.toLowerCase().includes(q) ||
        s.id.includes(q),
    )
    .slice(0, limit);
}
