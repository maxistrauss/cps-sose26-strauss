import type { DashboardLink } from "../types/dashboard";

export const dashboardLinks: DashboardLink[] = [
  {
    id: "overview",
    title: "Übersichts-Dashboard",
    description: "Übersicht über Parkplätze, Belegung, Status und Verfügbarkeit.",
    href: "#overview",
  },
  {
    id: "payment",
    title: "Bezahl-Dashboard",
    description: "Für Zahlungen, Tarife, offene Vorgänge und Buchungsstatus.",
    href: "#payment",
  },
  {
    id: "admin",
    title: "Admin-Dashboard",
    description: "Für Systemstatus, Rollen, Regeln und technische Konfiguration.",
    href: "#admin",
  },
];
