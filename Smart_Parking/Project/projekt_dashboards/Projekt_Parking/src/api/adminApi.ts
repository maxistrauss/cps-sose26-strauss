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

// MOCK-DATEN — nur für Screenshots/Dokumentation, kein Backend angebunden.
const MOCK_NOW = Date.now();
const minutesAgo = (m: number) => new Date(MOCK_NOW - m * 60_000).toISOString();

const MOCK_OPEN_SESSIONS: AdminSession[] = [
  { id: 101, plate: "R-AB 1234", entry_time: minutesAgo(47), amount_due: 1.5, amount_paid: 0 },
];

const MOCK_EVENT_LOGS: ApiEventLog[] = [
  { id: 8, timestamp: minutesAgo(17), eventtype: "spot_free",         source: "sensors",    message: "Sensor SEN-1-02 meldet Platz 2 frei.",                          parking_session_id: null },
  { id: 7, timestamp: minutesAgo(18), eventtype: "barrier_opened",    source: "barrier",    message: "Schranke Ausfahrt geöffnet.",                                    parking_session_id: 98  },
  { id: 6, timestamp: minutesAgo(19), eventtype: "exit_detected",     source: "cam-exit",   message: "Kennzeichen R-CD 5678 erkannt, Ausfahrt freigegeben.",          parking_session_id: 98  },
  { id: 5, timestamp: minutesAgo(20), eventtype: "payment_completed", source: "terminal-a", message: "Zahlung für R-CD 5678 abgeschlossen (3,00 €).",                 parking_session_id: 98  },
  { id: 4, timestamp: minutesAgo(30), eventtype: "rfid_admin_login",  source: "rfid",       message: "Admin Maria Muster hat sich am Terminal angemeldet.",           parking_session_id: null },
  { id: 3, timestamp: minutesAgo(45), eventtype: "spot_occupied",     source: "sensors",    message: "Sensor SEN-1-01 meldet Platz 1 belegt.",                         parking_session_id: 101 },
  { id: 2, timestamp: minutesAgo(46), eventtype: "barrier_opened",    source: "barrier",    message: "Schranke Einfahrt geöffnet.",                                    parking_session_id: 101 },
  { id: 1, timestamp: minutesAgo(47), eventtype: "entry_detected",    source: "cam-entry",  message: "Kennzeichen R-AB 1234 erkannt, Einfahrt freigegeben.",          parking_session_id: 101 },
];

const MOCK_RFID_ADMINS: RfidAdmin[] = [
  { id: 1, name: "Maria Muster", rfid_uid: "A1B2C3D4", role: "operator",   active: true  },
  { id: 2, name: "Klaus Kern",   rfid_uid: "F5E6D7C8", role: "technician", active: true  },
  { id: 3, name: "Alt-Konto",    rfid_uid: "9F8E7D6C", role: "operator",   active: false },
];

const MOCK_RFID_RELEASES: RfidRelease[] = [
  { id: 2, admin_id: 1, admin_name: "Maria Muster", rfid_uid: "A1B2C3D4", parking_session_id: 98,   release_time: minutesAgo(18)  },
  { id: 1, admin_id: 2, admin_name: "Klaus Kern",   rfid_uid: "F5E6D7C8", parking_session_id: null, release_time: minutesAgo(120) },
];

export function fetchEventLogs(filter: EventLogFilter = {}): Promise<ApiEventLog[]> {
  let results = MOCK_EVENT_LOGS;
  if (filter.eventtype) results = results.filter((e) => e.eventtype.includes(filter.eventtype!));
  if (filter.plate)     results = results.filter((e) => e.message.toUpperCase().includes(filter.plate!.toUpperCase()));
  if (filter.limit  !== undefined) results = results.slice(filter.offset ?? 0, (filter.offset ?? 0) + filter.limit);
  return Promise.resolve(results);
}

export function fetchOpenAdminSessions(): Promise<AdminSession[]> {
  return Promise.resolve(MOCK_OPEN_SESSIONS);
}

export function fetchAdminSession(sessionId: number): Promise<AdminSessionDetail> {
  const session = MOCK_OPEN_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_OPEN_SESSIONS[0];
  return Promise.resolve({
    ...session,
    payment_time: null,
    exit_time: null,
    exit_valid_until: null,
  });
}

export function patchAdminSession(
  sessionId: number,
  fields: { amount_paid?: number; payment_time?: string; exit_valid_until?: string },
): Promise<{ success: boolean; session_id: number }> {
  const session = MOCK_OPEN_SESSIONS.find((s) => s.id === sessionId);
  if (session && fields.amount_paid !== undefined) session.amount_paid = fields.amount_paid;
  return Promise.resolve({ success: true, session_id: sessionId });
}

export function fetchRfidAdmins(): Promise<RfidAdmin[]> {
  return Promise.resolve(MOCK_RFID_ADMINS);
}

export function postRfidAdmin(
  name: string,
  uid: string,
  active = true,
): Promise<{ success: boolean }> {
  MOCK_RFID_ADMINS.push({ id: MOCK_RFID_ADMINS.length + 1, name, rfid_uid: uid, role: "operator", active });
  return Promise.resolve({ success: true });
}

export function patchRfidAdmin(
  uid: string,
  active: boolean,
): Promise<{ success: boolean }> {
  const admin = MOCK_RFID_ADMINS.find((a) => a.rfid_uid === uid);
  if (admin) admin.active = active;
  return Promise.resolve({ success: true });
}

export function fetchRfidReleases(): Promise<RfidRelease[]> {
  return Promise.resolve(MOCK_RFID_RELEASES);
}
