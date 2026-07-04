import Link from "next/link";
import { notFound } from "next/navigation";
import { EditPlantForm } from "@/components/EditPlantForm";
import { fetchPlant } from "@/app/actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await fetchPlant(id);
  return { title: plant ? `Edit ${plant.nickname}` : "Edit plant" };
}

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await fetchPlant(id);
  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/plants/${id}`}
        className="text-sm font-medium text-foreground/60 no-underline hover:text-primary"
      >
        ← {plant.nickname}
      </Link>

      <div>
        <h1 className="font-display m-0 text-3xl uppercase tracking-tight text-primary">
          Edit plant
        </h1>
        <p className="m-0 mt-1 text-sm text-foreground/60">Update care settings and location</p>
      </div>

      <EditPlantForm plant={plant} />
    </div>
  );
}
