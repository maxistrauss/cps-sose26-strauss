import { dashboardLinks } from "../app/dashboardLinks";
import DashboardCard from "../components/ui/DashboardCard";
import AppShell from "../layouts/AppShell";

type HomePageProps = {
  onSelectDashboard?: (dashboardId: string) => void;
};

function HomePage({ onSelectDashboard }: HomePageProps) {
  return (
    <AppShell>
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Projekt Parking
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          VERWALTUNGS-DASHBOARDS
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          Deine drei Dashboards für die Verwaltung von Parkplätzen, Fahrzeugen und
          Benutzern - alle in einem einzigen, benutzerfreundlichen Frontend.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {dashboardLinks.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              onSelect={onSelectDashboard}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export default HomePage;
