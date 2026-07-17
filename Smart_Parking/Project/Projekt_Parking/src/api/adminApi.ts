import { apiFetch } from "./apiClient";
import type {
  AdminSession,
  AdminSessionDetail,
  ApiEventLog,
  RfidAdmin,
  RfidRelease,
} from "./types";

export type EventLogFilter = {
  eventtype?: string;
  plate?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export function fetchEventLogs(filter: EventLogFilter = {}): Promise<ApiEventLog[]> {
  const params = new URLSearchParams();
  if (filter.eventtype) params.set("eventtype", filter.eventtype);
  if (filter.plate)     params.set("plate", filter.plate);
  if (filter.from)      params.set("from", filter.from);
  if (filter.to)        params.set("to", filter.to);
  if (filter.limit  !== undefined) params.set("limit",  String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return apiFetch<ApiEventLog[]>(`/api/admin/event-logs${qs ? `?${qs}` : ""}`);
}

export function fetchOpenAdminSessions(): Promise<AdminSession[]> {
  return apiFetch<AdminSession[]>("/api/admin/parking-sessions/open");
}

export function fetchAdminSession(sessionId: number): Promise<AdminSessionDetail> {
  return apiFetch<AdminSessionDetail>(`/api/admin/parking-sessions/${sessionId}`);
}

export function patchAdminSession(
  sessionId: number,
  fields: { amount_paid?: number; payment_time?: string; exit_valid_until?: string },
): Promise<{ success: boolean; session_id: number }> {
  return apiFetch(`/api/admin/parking-sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export function fetchRfidAdmins(): Promise<RfidAdmin[]> {
  return apiFetch<RfidAdmin[]>("/api/admin/rfid-admins");
}

export function postRfidAdmin(
  name: string,
  uid: string,
  active = true,
): Promise<{ success: boolean }> {
  return apiFetch("/api/admin/rfid-admins", {
    method: "POST",
    body: JSON.stringify({ name, uid, active }),
  });
}

export function patchRfidAdmin(
  uid: string,
  active: boolean,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/rfid-admins/${encodeURIComponent(uid)}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export function fetchRfidReleases(): Promise<RfidRelease[]> {
  return apiFetch<RfidRelease[]>("/api/admin/rfid-releases");
}
