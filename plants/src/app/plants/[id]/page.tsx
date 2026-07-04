import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlantActions } from "@/components/PlantActions";
import { PhotoTimeline } from "@/components/PhotoTimeline";
import { PhotoUpload } from "@/components/PhotoUpload";
import { WaterExplain } from "@/components/WaterExplain";
import {
  deletePlantAction,
  fetchPlant,
  fetchPlantTimeline,
  listCareLogs,
} from "@/app/actions";
import { canEdit } from "@/lib/auth";
import { formatRelativeDays } from "@/lib/watering";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await fetchPlant(id);
  return { title: plant?.nickname ?? "Plant" };
}

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plant, isEditor, logs, timeline] = await Promise.all([
    fetchPlant(id),
    canEdit(),
    listCareLogs(id),
    fetchPlantTimeline(id),
  ]);
  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <Link href="/plants" className="text-sm font-medium text-foreground/60 no-underline hover:text-primary">
        ← All plants
      </Link>

      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display m-0 text-3xl uppercase tracking-tight">{plant.nickname}</h1>
            <p className="m-0 mt-1 text-foreground/70">
              {plant.species.typeName} · {plant.room.name}
            </p>
          </div>
          {isEditor && (
            <Link
              href={`/plants/${plant.id}/edit`}
              className="btn-secondary shrink-0 no-underline"
              title="Edit plant"
            >
              <PencilSimple size={18} aria-hidden />
              <span className="sr-only">Edit</span>
            </Link>
          )}
        </div>
        <p className="m-0 mt-3 text-sm font-medium">
          {formatRelativeDays(plant.daysUntilWater)} · Next: {plant.nextWaterDate}
        </p>
      </header>

      {isEditor ? (
        <>
          <PlantActions plantId={plant.id} />
          <PhotoUpload plantId={plant.id} photoDue={plant.photoDue} />
        </>
      ) : (
        <p className="m-0 text-sm text-foreground/55">
          <Link href="/login" className="font-medium text-primary no-underline">
            Sign in
          </Link>{" "}
          to log watering or upload photos.
        </p>
      )}

      <WaterExplain breakdown={plant.waterBreakdown} />

      {timeline.length > 0 && <PhotoTimeline entries={timeline} />}

      <section className="plant-card p-5">
        <h2 className="font-display m-0 text-base uppercase tracking-tight">Care info</h2>
        <p className="m-0 mt-3 text-sm leading-relaxed text-foreground/80">{plant.species.careTips}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-foreground/50">Light</dt>
            <dd className="m-0 font-medium">{plant.species.lightPreference}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">Humidity</dt>
            <dd className="m-0 font-medium">{plant.species.humidityPreference}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">Toxicity</dt>
            <dd className="m-0 font-medium">{plant.species.plantToxicity}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">Pot</dt>
            <dd className="m-0 font-medium capitalize">
              {plant.potSize} · {plant.potMaterial}
            </dd>
          </div>
        </dl>
      </section>

      {plant.latestAnalysis && (
        <section className={`plant-card p-5 health-${plant.latestAnalysis.overallHealth}`}>
          <h2 className="font-display m-0 text-base uppercase tracking-tight">Latest check-in</h2>
          <p className="m-0 mt-2 text-sm">{plant.latestAnalysis.summary}</p>
          <p className="m-0 mt-2 text-xs text-foreground/50">
            {plant.latestAnalysis.createdAt.slice(0, 10)}
          </p>
        </section>
      )}

      {logs.length > 0 && (
        <section className="plant-card p-5">
          <h2 className="font-display m-0 text-base uppercase tracking-tight">History</h2>
          <ul className="m-0 mt-3 list-none space-y-2 p-0">
            {logs.map((log) => (
              <li key={log.id} className="flex justify-between gap-2 text-sm">
                <span className="capitalize">{log.taskType}</span>
                <span className="text-foreground/50">{log.completedAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isEditor && (
        <form
          action={async () => {
            "use server";
            const result = await deletePlantAction(id);
            if (result && "error" in result) return;
            redirect("/plants");
          }}
        >
          <button type="submit" className="btn-secondary w-full text-overdue">
            Remove plant
          </button>
        </form>
      )}
    </div>
  );
}
