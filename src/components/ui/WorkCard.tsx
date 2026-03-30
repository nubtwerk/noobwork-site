import { WorkItem } from "@/types";

interface WorkCardProps {
  item: WorkItem;
}

export default function WorkCard({ item }: WorkCardProps) {
  const [role, phase] = item.status.split("|").map((value) => value.trim());
  const hasRowLink = Boolean(item.url);

  const content = (
    <>
      <div className="work-card__head">
        <p className="work-card__role">{role}</p>
        <h3 className="work-card__title">{item.name}</h3>
        {item.companies?.length ? (
          <div className="work-card__companies">
            {item.companies.map((company) =>
              company.url ? (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="work-card__company-row"
                >
                  <span className="work-card__company-marker" aria-hidden="true" />
                  <span className="work-card__company-text">{company.name}</span>
                </a>
              ) : (
                <span key={company.name} className="work-card__company-row">
                  <span className="work-card__company-marker" aria-hidden="true" />
                  <span className="work-card__company-text">{company.name}</span>
                </span>
              ),
            )}
          </div>
        ) : null}
      </div>
      <div className="work-card__meta">
        {phase ? <span className="work-card__status">{phase}</span> : null}
      </div>
      <p className="work-card__copy">{item.desc}</p>
    </>
  );

  if (hasRowLink) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="work-card work-card--linked block"
      >
        {content}
      </a>
    );
  }

  return <div className="work-card">{content}</div>;
}
