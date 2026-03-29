import { WorkItem } from "@/types";

interface WorkCardProps {
  item: WorkItem;
}

export default function WorkCard({ item }: WorkCardProps) {
  return (
    <div className="work-card">
      <div className="work-card__top">
        <h3 className="work-card__title">{item.name}</h3>
        <span className="work-card__status">{item.status}</span>
      </div>
      <p className="work-card__copy">{item.desc}</p>
    </div>
  );
}
