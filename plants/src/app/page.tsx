import { canEdit } from "@/lib/auth";
import { PlantCard } from "@/components/PlantCard";
import { fetchTodayPlants } from "@/app/actions";
import type { PlantWithMeta } from "@/types";

function groupPlants(plants: PlantWithMeta[]) {
  return {
    overdue: plants.filter((p) => p.waterStatus === "overdue"),
    dueToday: plants.filter((p) => p.waterStatus === "due_today"),
    upcoming: plants.filter((p) => p.waterStatus === "upcoming"),
    onTrack: plants.filter((p) => p.waterStatus === "on_track"),
    photoDue: plants.filter((p) => p.photoDue),
  };
}

export default async function TodayPage() {
  const plants = await fetchTodayPlants();
  const isEditor = await canEdit();
  const groups = groupPlants(plants);
  const needsAttention = [...groups.overdue, ...groups.dueToday];

  return (
    <div className="space-y-8">
      <div>
        <p className="m-0 text-sm text-foreground/55">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl uppercase tracking-tight text-primary">
          Today
        </h1>
      </div>

      {plants.length === 0 ? (
        <div className="plant-card p-8 text-center">
          <p className="m-0 text-foreground/70">No plants yet.</p>
          <p className="m-0 mt-2 text-sm text-foreground/55">
            Add your first plant to start watering timers.
          </p>
        </div>
      ) : (
        <>
          {needsAttention.length > 0 && (
            <section>
              <h2 className="font-display mb-3 text-sm uppercase tracking-wide text-foreground/55">
                Needs water
              </h2>
              <div className="space-y-3">
                {needsAttention.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} canEdit={isEditor} />
                ))}
              </div>
            </section>
          )}

          {groups.photoDue.length > 0 && (
            <section>
              <h2 className="font-display mb-3 text-sm uppercase tracking-wide text-foreground/55">
                Photo check-ins
              </h2>
              <div className="space-y-3">
                {groups.photoDue.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} compact />
                ))}
              </div>
            </section>
          )}

          {groups.upcoming.length > 0 && (
            <section>
              <h2 className="font-display mb-3 text-sm uppercase tracking-wide text-foreground/55">
                Coming up
              </h2>
              <div className="space-y-3">
                {groups.upcoming.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} compact />
                ))}
              </div>
            </section>
          )}

          {groups.onTrack.length > 0 && (
            <section>
              <h2 className="font-display mb-3 text-sm uppercase tracking-wide text-foreground/55">
                On track ({groups.onTrack.length})
              </h2>
              <div className="space-y-3">
                {groups.onTrack.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} compact />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
