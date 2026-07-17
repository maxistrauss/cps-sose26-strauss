import type { DashboardLink } from "../../types/dashboard";

type DashboardCardProps = {
  dashboard: DashboardLink;
  onSelect?: (dashboardId: string) => void;
};

function DashboardCard({ dashboard, onSelect }: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(dashboard.id)}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mb-3 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
        {dashboard.id}
      </div>
      <h2 className="mb-2 text-2xl font-semibold">{dashboard.title}</h2>
      <p className="text-sm leading-6 text-slate-600">{dashboard.description}</p>
    </button>
  );
}

export default DashboardCard;
