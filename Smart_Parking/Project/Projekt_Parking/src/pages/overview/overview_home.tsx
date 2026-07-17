import AppShell from "../../layouts/AppShell";
import { useFetch } from "../../hooks/useFetch";
import { fetchParkingSpots, fetchMapOverview } from "../../api/mapApi";
import { fetchEventLogs, fetchOpenAdminSessions } from "../../api/adminApi";

type OverviewHomeProps = {
  onBack?: () => void;
};

function formatDuration(entryTime: string): string {
  const diffMs = Date.now() - new Date(entryTime).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} Std. ${minutes} Min.`;
  return `${minutes} Min.`;
}

function formatDateTime(timestamp: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function floorLabel(floor: number): string {
  return floor === 1 ? "Erdgeschoss" : `${floor - 1}. Obergeschoss`;
}

type StatCardProps = {
  label: string;
  value: string | number;
  accent?: "slate" | "rose" | "emerald" | "amber";
  loading?: boolean;
};

function StatCard({ label, value, accent = "slate", loading = false }: StatCardProps) {
  const valueColor: Record<string, string> = {
    slate:   "text-slate-950",
    rose:    "text-rose-600",
    emerald: "text-emerald-600",
    amber:   "text-amber-600",
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className={`mt-2 text-4xl font-semibold ${valueColor[accent]}`}>{value}</p>
      )}
    </div>
  );
}

type ErrorBannerProps = { message: string; onRetry: () => void };

function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-800">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="ml-4 shrink-0 rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-semibold hover:bg-rose-200"
      >
        Erneut versuchen
      </button>
    </div>
  );
}

function OverviewHome({ onBack }: OverviewHomeProps) {
  const spotsResult    = useFetch(fetchParkingSpots,                             { pollingMs: 30_000 });
  const overviewResult = useFetch(fetchMapOverview,                              { pollingMs: 30_000 });
  const sessionsResult = useFetch(fetchOpenAdminSessions,                        { pollingMs: 30_000 });
  const eventsResult   = useFetch(() => fetchEventLogs({ limit: 12 }),           { pollingMs: 60_000 });

  const overview  = overviewResult.data;
  const spots     = spotsResult.data ?? [];
  const sessions  = sessionsResult.data ?? [];
  const events    = eventsResult.data ?? [];

  const occupancyPct = overview
    ? Math.round((overview.occupied_spots / overview.total_spots) * 100)
    : 0;

  const floors = [...new Set(spots.map((s) => s.floor))].sort();

  return (
    <AppShell>
      <section className="min-h-screen bg-slate-100 px-6 py-6">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Projekt Parking
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              Übersichts-Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Zurück
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Gesamt"
            value={overview?.total_spots ?? "—"}
            loading={overviewResult.loading && !overview}
          />
          <StatCard
            label="Belegt"
            value={overview?.occupied_spots ?? "—"}
            accent="rose"
            loading={overviewResult.loading && !overview}
          />
          <StatCard
            label="Frei"
            value={overview?.free_spots ?? "—"}
            accent="emerald"
            loading={overviewResult.loading && !overview}
          />
          <StatCard
            label="Auslastung"
            value={overview ? `${occupancyPct} %` : "—"}
            accent={occupancyPct >= 80 ? "rose" : occupancyPct >= 50 ? "amber" : "emerald"}
            loading={overviewResult.loading && !overview}
          />
        </div>

        {overviewResult.error && (
          <div className="mb-6">
            <ErrorBanner message={overviewResult.error} onRetry={overviewResult.refetch} />
          </div>
        )}

        {/* Floor visualization */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Parkdeck
            </p>
            {spotsResult.loading && spotsResult.data !== null && (
              <span className="text-xs text-slate-400">Aktualisierung…</span>
            )}
          </div>

          {spotsResult.error ? (
            <ErrorBanner message={spotsResult.error} onRetry={spotsResult.refetch} />
          ) : spotsResult.loading && spots.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {floors.map((floor) => {
                const floorSpots    = spots.filter((s) => s.floor === floor);
                const floorOccupied = floorSpots.filter((s) => s.occupied).length;
                return (
                  <div key={floor}>
                    <div className="mb-2 flex items-baseline gap-3">
                      <p className="text-sm font-semibold text-slate-700">{floorLabel(floor)}</p>
                      <p className="text-xs text-slate-400">
                        {floorOccupied} / {floorSpots.length} belegt
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {floorSpots.map((spot) => (
                        <div
                          key={spot.id}
                          title={`Platz ${spot.spot_number} – ${spot.occupied ? "Belegt" : "Frei"}`}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-semibold transition ${
                            spot.occupied
                              ? "bg-rose-500 text-white"
                              : "border border-emerald-200 bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {spot.spot_number}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-rose-500" />
              Belegt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-emerald-200 bg-emerald-100" />
              Frei
            </span>
          </div>
        </div>

        {/* Active sessions */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Aktive Parksitzungen ({sessions.length})
          </p>

          {sessionsResult.error ? (
            <ErrorBanner message={sessionsResult.error} onRetry={sessionsResult.refetch} />
          ) : sessionsResult.loading && sessions.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500">Keine aktiven Sitzungen.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    <th className="pb-3 pr-6">Kennzeichen</th>
                    <th className="pb-3 pr-6">Einfahrt</th>
                    <th className="pb-3 pr-6">Dauer</th>
                    <th className="pb-3 pr-6">Bezahlt</th>
                    <th className="pb-3 text-right">Fällig</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-6 font-semibold text-slate-950">{session.plate}</td>
                      <td className="py-3 pr-6 text-slate-600">{formatDateTime(session.entry_time)}</td>
                      <td className="py-3 pr-6 text-slate-600">{formatDuration(session.entry_time)}</td>
                      <td className="py-3 pr-6 text-slate-600">{session.amount_paid.toFixed(2)} €</td>
                      <td className="py-3 text-right font-semibold text-slate-950">
                        {session.amount_due.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent events */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Letzte Ereignisse
          </p>

          {eventsResult.error ? (
            <ErrorBanner message={eventsResult.error} onRetry={eventsResult.refetch} />
          ) : eventsResult.loading && events.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Ereignisse vorhanden.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-slate-400">
                    {formatTime(event.timestamp)}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {event.source ?? "—"} · {event.eventtype}
                    </p>
                    <p className="text-sm text-slate-700">{event.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default OverviewHome;
