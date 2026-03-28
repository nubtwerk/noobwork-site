import { ArrowUpRight } from "lucide-react";
import { WorkItem } from "@/types";

interface WorkCardProps {
  item: WorkItem;
}

export default function WorkCard({ item }: WorkCardProps) {
  const content = (
    <>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-[family-name:var(--font-newake)] text-xl uppercase tracking-tight text-foreground">{item.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">{item.status}</span>
          {item.url && <ArrowUpRight className="w-4 h-4 text-primary shrink-0" />}
        </div>
      </div>
      <p className="text-foreground/70">{item.desc}</p>
    </>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-surface rounded-xl p-6 border border-border hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      {content}
    </div>
  );
}
