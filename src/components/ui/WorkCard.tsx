import { ArrowUpRight } from "lucide-react";
import { WorkItem } from "@/types";

interface WorkCardProps {
  item: WorkItem;
}

export default function WorkCard({ item }: WorkCardProps) {
  const content = (
    <>
      <div className="work-card__top">
        <h3 className="work-card__title">{item.name}</h3>
        <div className="flex items-center gap-2">
          <span className="work-card__status">{item.status}</span>
          {item.url ? <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
        </div>
      </div>
      <p className="work-card__copy">{item.desc}</p>
    </>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="work-card block"
      >
        {content}
      </a>
    );
  }

  return <div className="work-card">{content}</div>;
}
