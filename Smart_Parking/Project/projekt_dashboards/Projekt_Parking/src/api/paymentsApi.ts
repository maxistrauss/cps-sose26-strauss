import { apiFetch } from "./apiClient";
import type { OpenSession, PatchPaymentResult, SessionByPlate } from "./types";

export function fetchOpenSessions(): Promise<OpenSession[]> {
  return apiFetch<OpenSession[]>("/api/payments/open-sessions");
}

export function fetchSessionByPlate(plate: string): Promise<SessionByPlate> {
  return apiFetch<SessionByPlate>(`/api/payments/session/by-plate/${encodeURIComponent(plate)}`);
}

// Zahlt den offenen Betrag vollständig — kein Body nötig, Node-RED setzt amount_paid = amount_due
export function patchPaymentSession(sessionId: number): Promise<PatchPaymentResult> {
  return apiFetch<PatchPaymentResult>(`/api/payments/session/${sessionId}`, {
    method: "GET",
  });
}
