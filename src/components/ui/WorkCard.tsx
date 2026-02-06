import { WorkItem } from "@/types";

interface WorkCardProps {
  item: WorkItem;
}

export default function WorkCard({ item }: WorkCardProps) {
  return (
    <div className="bg-surface rounded-xl p-6 border border-border hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
        <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">{item.status}</span>
      </div>
      <p className="text-foreground/70">{item.desc}</p>
    </div>
  );
}
