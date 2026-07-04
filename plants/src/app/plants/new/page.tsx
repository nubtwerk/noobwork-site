import Link from "next/link";
import { AddPlantForm } from "@/components/AddPlantForm";

export const metadata = { title: "Add plant" };

export default function NewPlantPage() {
  return (
    <div className="space-y-6">
      <Link href="/plants" className="text-sm font-medium text-foreground/60 no-underline hover:text-primary">
        ← Back
      </Link>
      <div>
        <h1 className="font-display m-0 text-3xl uppercase tracking-tight text-primary">
          Add plant
        </h1>
        <p className="m-0 mt-1 text-sm text-foreground/60">
          Pick a species — watering timer starts from today.
        </p>
      </div>
      <AddPlantForm />
    </div>
  );
}
