export type SystemComponent = {
  id: string;
  name: string;
  status: "online" | "warning" | "offline";
  lastCheck: string;
  details: string;
};

export type PricingRule = {
  id: number;
  label: string;
  ratePerHour: number;
  minMinutes: number;
  maxMinutes: number | null;
};

export type SystemUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "technician";
  lastLogin: string;
  active: boolean;
};

const systemComponents: SystemComponent[] = [
  {
    id: "cam-entry",
    name: "Einfahrt-Kamera",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Kennzeichenerkennung aktiv. FPS: 30.",
  },
  {
    id: "cam-exit",
    name: "Ausfahrt-Kamera",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Kennzeichenerkennung aktiv. FPS: 30.",
  },
  {
    id: "sensors",
    name: "Parkplatzsensoren",
    status: "warning",
    lastCheck: "2026-06-17T12:58:00",
    details: "Sensor SEN-3-65 sendet keine Daten.",
  },
  {
    id: "terminal-a",
    name: "Zahlungsterminal A",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Kartenzahlung und QR-Code aktiv.",
  },
  {
    id: "terminal-b",
    name: "Zahlungsterminal B",
    status: "offline",
    lastCheck: "2026-06-17T11:45:00",
    details: "Verbindung unterbrochen. Neustart ausstehend.",
  },
  {
    id: "barrier",
    name: "Schranken-System",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Einfahrt und Ausfahrt normal.",
  },
  {
    id: "db",
    name: "Datenbank",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Replikation aktiv. Latenz: 2 ms.",
  },
  {
    id: "network",
    name: "Netzwerk-Gateway",
    status: "online",
    lastCheck: "2026-06-17T13:00:00",
    details: "Uplink 100 Mbit/s stabil.",
  },
];

const pricingRules: PricingRule[] = [
  { id: 1, label: "Kurzparken",     ratePerHour: 2.0,  minMinutes: 0,   maxMinutes: 60  },
  { id: 2, label: "Standardtarif", ratePerHour: 1.5,  minMinutes: 61,  maxMinutes: 480 },
  { id: 3, label: "Tagespauschale",ratePerHour: 1.0,  minMinutes: 481, maxMinutes: null },
];

const systemUsers: SystemUser[] = [
  { id: 1, name: "Admin System",  email: "admin@parkhaus.de",     role: "admin",      lastLogin: "2026-06-17T08:00:00", active: true  },
  { id: 2, name: "Maria Muster",  email: "m.muster@parkhaus.de",  role: "operator",   lastLogin: "2026-06-17T07:45:00", active: true  },
  { id: 3, name: "Klaus Kern",    email: "k.kern@parkhaus.de",    role: "operator",   lastLogin: "2026-06-16T18:30:00", active: true  },
  { id: 4, name: "Tech Support",  email: "technik@parkhaus.de",   role: "technician", lastLogin: "2026-06-15T10:00:00", active: true  },
  { id: 5, name: "Alt-Account",   email: "alt@parkhaus.de",       role: "operator",   lastLogin: "2026-05-01T09:00:00", active: false },
];

export function getSystemComponents(): SystemComponent[] {
  return systemComponents;
}

export function getPricingRules(): PricingRule[] {
  return pricingRules;
}

export function getSystemUsers(): SystemUser[] {
  return systemUsers;
}
