import { useState } from "react";
import AppShell from "../../layouts/AppShell";
import { useFetch } from "../../hooks/useFetch";
import {
  fetchEventLogs,
  fetchOpenAdminSessions,
  fetchRfidAdmins,
  fetchRfidReleases,
  patchAdminSession,
  patchRfidAdmin,
  postRfidAdmin,
  type EventLogFilter,
} from "../../api/adminApi";
import type { RfidAdmin } from "../../api/types";
import {
  getSystemComponents,
  getPricingRules,
  type SystemComponent,
} from "../../backend/adminStore";

type AdminHomeProps = {
  onBack?: () => void;
};

function formatDateTime(timestamp: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatEventTime(timestamp: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function statusLabel(status: SystemComponent["status"]): string {
  return status === "online" ? "Online" : status === "warning" ? "Warnung" : "Offline";
}

function statusColors(status: SystemComponent["status"]) {
  if (status === "online")  return { card: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-600 text-white" };
  if (status === "warning") return { card: "border-amber-200 bg-amber-50",     badge: "bg-amber-500 text-white" };
  return                           { card: "border-rose-200 bg-rose-50",        badge: "bg-rose-600 text-white" };
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
      {children}
    </p>
  );
}

const CAMERA_ENTRY_URL = import.meta.env.VITE_CAMERA_ENTRY_URL as string | undefined;
const CAMERA_EXIT_URL  = import.meta.env.VITE_CAMERA_EXIT_URL  as string | undefined;

type CameraCardProps = {
  label: string;
  url: string | undefined;
  hasError: boolean;
  retryCount: number;
  onError: () => void;
  onRetry: () => void;
};

function CameraCard({ label, url, hasError, retryCount, onError, onRetry }: CameraCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-slate-900">
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        {hasError && url && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-600"
          >
            Erneut verbinden
          </button>
        )}
      </div>
      {url && !hasError ? (
        <img
          key={retryCount}
          src={url}
          alt={`Live-Feed ${label}`}
          onError={onError}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center text-sm text-slate-500">
          {url ? "Kamera nicht erreichbar" : "URL nicht konfiguriert (.env)"}
        </div>
      )}
    </div>
  );
}

function AdminHome({ onBack }: AdminHomeProps) {
  const components   = getSystemComponents();
  const pricingRules = getPricingRules();

  // --- Kameras ---
  const [entryError,      setEntryError]      = useState(false);
  const [exitError,       setExitError]        = useState(false);
  const [entryRetryCount, setEntryRetryCount]  = useState(0);
  const [exitRetryCount,  setExitRetryCount]   = useState(0);

  // --- RFID Admins ---
  const rfidResult = useFetch(fetchRfidAdmins);
  const [togglingUid, setTogglingUid]     = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName]             = useState("");
  const [newUid, setNewUid]               = useState("");
  const [createError, setCreateError]     = useState("");
  const [isCreating, setIsCreating]       = useState(false);

  async function handleToggleRfid(admin: RfidAdmin) {
    setTogglingUid(admin.rfid_uid);
    try {
      await patchRfidAdmin(admin.rfid_uid, !admin.active);
      rfidResult.refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler beim Aktualisieren.");
    } finally {
      setTogglingUid(null);
    }
  }

  async function handleCreateRfid(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newUid.trim()) return;
    setIsCreating(true);
    setCreateError("");
    try {
      await postRfidAdmin(newName.trim(), newUid.trim());
      setNewName("");
      setNewUid("");
      setShowCreateForm(false);
      rfidResult.refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Fehler beim Anlegen.");
    } finally {
      setIsCreating(false);
    }
  }

  // --- RFID Releases ---
  const releasesResult = useFetch(fetchRfidReleases);

  // --- Open Sessions ---
  const sessionsResult = useFetch(fetchOpenAdminSessions, { pollingMs: 30_000 });
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editAmount, setEditAmount]             = useState("");
  const [isSavingSession, setIsSavingSession]   = useState(false);

  async function handleSaveSession(sessionId: number) {
    const amount = parseFloat(editAmount);
    if (Number.isNaN(amount) || amount < 0) return;
    setIsSavingSession(true);
    try {
      await patchAdminSession(sessionId, { amount_paid: amount });
      setEditingSessionId(null);
      sessionsResult.refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSavingSession(false);
    }
  }

  // --- Event Log ---
  const [filterEventtype, setFilterEventtype] = useState("");
  const [filterPlate,     setFilterPlate]     = useState("");

  const activeFilter: EventLogFilter = {
    eventtype: filterEventtype.trim() || undefined,
    plate:     filterPlate.trim()     || undefined,
    limit: 100,
  };

  const eventsResult = useFetch(
    () => fetchEventLogs(activeFilter),
    { pollingMs: 60_000 },
  );

  function handleSearchEvents(e: React.FormEvent) {
    e.preventDefault();
    eventsResult.refetch();
  }

  // Derived system status counts
  const onlineCount  = components.filter((c) => c.status === "online").length;
  const warningCount = components.filter((c) => c.status === "warning").length;
  const offlineCount = components.filter((c) => c.status === "offline").length;

  return (
    <AppShell>
      <section className="min-h-screen bg-slate-100 px-6 py-6">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Projekt Parking
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              Admin-Dashboard
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

        {/* System status (static mock) */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <SectionTitle>Systemstatus</SectionTitle>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-emerald-600">{onlineCount} Online</span>
              {warningCount > 0 && <span className="text-amber-600">{warningCount} Warnung</span>}
              {offlineCount > 0 && <span className="text-rose-600">{offlineCount} Offline</span>}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {components.map((component) => {
              const colors = statusColors(component.status);
              return (
                <div key={component.id} className={`rounded-2xl border p-4 ${colors.card}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{component.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${colors.badge}`}>
                      {statusLabel(component.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{component.details}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Geprüft: {formatDateTime(component.lastCheck)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live-Kameras */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <SectionTitle>Live-Kameras</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <CameraCard
              label="Einfahrt"
              url={CAMERA_ENTRY_URL}
              hasError={entryError}
              retryCount={entryRetryCount}
              onError={() => setEntryError(true)}
              onRetry={() => { setEntryError(false); setEntryRetryCount((n) => n + 1); }}
            />
            <CameraCard
              label="Ausfahrt"
              url={CAMERA_EXIT_URL}
              hasError={exitError}
              retryCount={exitRetryCount}
              onError={() => setExitError(true)}
              onRetry={() => { setExitError(false); setExitRetryCount((n) => n + 1); }}
            />
          </div>
        </div>

        {/* Open sessions with edit */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <SectionTitle>
            Offene Parksessions ({sessionsResult.data?.length ?? "…"})
          </SectionTitle>

          {sessionsResult.error ? (
            <ErrorBanner message={sessionsResult.error} onRetry={sessionsResult.refetch} />
          ) : sessionsResult.loading && !sessionsResult.data ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (sessionsResult.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Keine offenen Sitzungen.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    <th className="pb-3 pr-6">ID</th>
                    <th className="pb-3 pr-6">Kennzeichen</th>
                    <th className="pb-3 pr-6">Einfahrt</th>
                    <th className="pb-3 pr-6">Fällig</th>
                    <th className="pb-3 pr-6">Bezahlt</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(sessionsResult.data ?? []).map((session) => (
                    <>
                      <tr key={session.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-6 font-mono text-xs text-slate-400">{session.id}</td>
                        <td className="py-3 pr-6 font-semibold text-slate-950">{session.plate}</td>
                        <td className="py-3 pr-6 text-slate-600">{formatDateTime(session.entry_time)}</td>
                        <td className="py-3 pr-6 text-slate-600">{session.amount_due.toFixed(2)} €</td>
                        <td className="py-3 pr-6 text-slate-600">{session.amount_paid.toFixed(2)} €</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSessionId(session.id);
                              setEditAmount(String(session.amount_paid));
                            }}
                            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            Bearbeiten
                          </button>
                        </td>
                      </tr>
                      {editingSessionId === session.id && (
                        <tr key={`edit-${session.id}`}>
                          <td colSpan={6} className="pb-3 pt-1">
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                              <label className="text-xs font-semibold text-slate-500">
                                Bezahlter Betrag (€):
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-32 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-950 outline-none focus:border-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveSession(session.id)}
                                disabled={isSavingSession}
                                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-300"
                              >
                                {isSavingSession ? "Speichern…" : "Speichern"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RFID Admins */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SectionTitle>RFID-Admins ({rfidResult.data?.length ?? "…"})</SectionTitle>
            <button
              type="button"
              onClick={() => { setShowCreateForm((v) => !v); setCreateError(""); }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              {showCreateForm ? "Abbrechen" : "+ Neuer Admin"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateRfid} className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Neuen RFID-Admin anlegen
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Max Mustermann"
                    required
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">RFID-UID</label>
                  <input
                    type="text"
                    value={newUid}
                    onChange={(e) => setNewUid(e.target.value.toUpperCase())}
                    placeholder="A1B2C3D4"
                    required
                    className="rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-950 outline-none focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-300"
                >
                  {isCreating ? "Anlegen…" : "Anlegen"}
                </button>
              </div>
              {createError && (
                <p className="mt-2 text-xs font-semibold text-rose-700">{createError}</p>
              )}
            </form>
          )}

          {rfidResult.error ? (
            <ErrorBanner message={rfidResult.error} onRetry={rfidResult.refetch} />
          ) : rfidResult.loading && !rfidResult.data ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : (rfidResult.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Keine RFID-Admins vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    <th className="pb-3 pr-6">Name</th>
                    <th className="pb-3 pr-6">RFID-UID</th>
                    <th className="pb-3 pr-6">Rolle</th>
                    <th className="pb-3 pr-6">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(rfidResult.data ?? []).map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-6 font-semibold text-slate-950">{admin.name}</td>
                      <td className="py-3 pr-6 font-mono text-xs text-slate-500">{admin.rfid_uid}</td>
                      <td className="py-3 pr-6 text-slate-600">{admin.role}</td>
                      <td className="py-3 pr-6">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          admin.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {admin.active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={togglingUid === admin.rfid_uid}
                          onClick={() => handleToggleRfid(admin)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          {togglingUid === admin.rfid_uid
                            ? "…"
                            : admin.active ? "Deaktivieren" : "Aktivieren"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RFID Releases */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <SectionTitle>RFID-Schrankenfreigaben ({releasesResult.data?.length ?? "…"})</SectionTitle>

          {releasesResult.error ? (
            <ErrorBanner message={releasesResult.error} onRetry={releasesResult.refetch} />
          ) : releasesResult.loading && !releasesResult.data ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : (releasesResult.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Keine Schrankenfreigaben vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    <th className="pb-3 pr-6">Zeit</th>
                    <th className="pb-3 pr-6">Admin</th>
                    <th className="pb-3 pr-6">RFID-UID</th>
                    <th className="pb-3">Session-ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(releasesResult.data ?? []).map((release) => (
                    <tr key={release.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-6 text-slate-600">{formatDateTime(release.release_time)}</td>
                      <td className="py-3 pr-6 font-semibold text-slate-950">{release.admin_name}</td>
                      <td className="py-3 pr-6 font-mono text-xs text-slate-500">{release.rfid_uid}</td>
                      <td className="py-3 text-slate-500">{release.parking_session_id ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pricing rules (static mock) */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <SectionTitle>Preisregeln</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  <th className="pb-3 pr-6">Tarif</th>
                  <th className="pb-3 pr-6">€ / Stunde</th>
                  <th className="pb-3 pr-6">Ab Minute</th>
                  <th className="pb-3">Bis Minute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pricingRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-6 font-semibold text-slate-950">{rule.label}</td>
                    <td className="py-3 pr-6 text-slate-600">{rule.ratePerHour.toFixed(2)} €</td>
                    <td className="py-3 pr-6 text-slate-600">{rule.minMinutes}</td>
                    <td className="py-3 text-slate-600">{rule.maxMinutes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event log with filters */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <SectionTitle>Ereignisprotokoll</SectionTitle>

          <form onSubmit={handleSearchEvents} className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Ereignistyp</label>
              <input
                type="text"
                value={filterEventtype}
                onChange={(e) => setFilterEventtype(e.target.value)}
                placeholder="z. B. entry_detected"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Kennzeichen</label>
              <input
                type="text"
                value={filterPlate}
                onChange={(e) => setFilterPlate(e.target.value.toUpperCase())}
                placeholder="R-AB 1234"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Suchen
            </button>
            {(filterEventtype || filterPlate) && (
              <button
                type="button"
                onClick={() => {
                  setFilterEventtype("");
                  setFilterPlate("");
                  setTimeout(() => eventsResult.refetch(), 0);
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Filter zurücksetzen
              </button>
            )}
          </form>

          {eventsResult.error ? (
            <ErrorBanner message={eventsResult.error} onRetry={eventsResult.refetch} />
          ) : eventsResult.loading && !eventsResult.data ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (eventsResult.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Keine Ereignisse gefunden.</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-400">
                {eventsResult.data?.length} Einträge
                {eventsResult.loading && " · Aktualisierung…"}
              </p>
              <div className="space-y-2">
                {(eventsResult.data ?? []).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="mt-0.5 shrink-0 font-mono text-xs text-slate-400">
                      {formatEventTime(event.timestamp)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {event.source ?? "—"}
                        </span>
                        <span className="text-xs text-slate-400">{event.eventtype}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{event.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default AdminHome;
