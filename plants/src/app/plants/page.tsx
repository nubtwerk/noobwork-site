import Link from "next/link";
import { canEdit } from "@/lib/auth";
import { hasMultipleRooms } from "@/lib/rooms";
import { PlantCard } from "@/components/PlantCard";
import { RoomGroupView } from "@/components/RoomGroupView";
import { fetchTodayPlants } from "@/app/actions";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "All plants" };

export default async function PlantsPage() {
  const plants = await fetchTodayPlants();
  const isEditor = await canEdit();
  const showRoom = hasMultipleRooms(plants);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-3xl uppercase tracking-tight text-primary">
            All plants
          </h1>
          <p className="m-0 mt-1 text-sm text-foreground/60">{plants.length} in your apartment</p>
        </div>
        {isEditor && (
          <Link href="/api/export" className="btn-secondary shrink-0 no-underline">
            <DownloadSimple size={18} aria-hidden />
            Export
          </Link>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="plant-card p-8 text-center">
          <p className="m-0 text-foreground/70">
            {isEditor ? (
              <>
                <Link href="/plants/new" className="font-semibold text-primary">
                  Add a plant
                </Link>{" "}
                to get started.
              </>
            ) : (
              "No plants in the collection yet."
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} canEdit={isEditor} showRoom={showRoom} />
            ))}
          </div>
          <RoomGroupView plants={plants} canEdit={isEditor} />
        </>
      )}
    </div>
  );
}
