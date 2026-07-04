import { PlantCard } from "@/components/PlantCard";
import type { PlantWithMeta } from "@/types";

export function RoomGroupView({
  plants,
  canEdit,
}: {
  plants: PlantWithMeta[];
  canEdit: boolean;
}) {
  const byRoom = new Map<string, { name: string; plants: PlantWithMeta[] }>();

  for (const plant of plants) {
    const existing = byRoom.get(plant.roomId);
    if (existing) {
      existing.plants.push(plant);
    } else {
      byRoom.set(plant.roomId, { name: plant.room.name, plants: [plant] });
    }
  }

  const rooms = [...byRoom.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));

  if (rooms.length <= 1) return null;

  return (
    <section className="space-y-6">
      <h2 className="font-display m-0 text-sm uppercase tracking-wide text-foreground/55">
        By room
      </h2>
      {rooms.map(([roomId, { name, plants: roomPlants }]) => (
        <div key={roomId}>
          <h3 className="font-display m-0 mb-3 text-base uppercase tracking-tight text-primary">
            {name}
            <span className="ml-2 text-sm font-normal text-foreground/50">({roomPlants.length})</span>
          </h3>
          <div className="space-y-3">
            {roomPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} compact canEdit={canEdit} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
