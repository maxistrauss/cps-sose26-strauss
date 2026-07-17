import type {
  EventLog,
  EventType,
  ParkingSession,
  ParkingSpot,
  PaymentSessionDetails,
} from "../types/parking";

const parkingSessions: ParkingSession[] = [
  {
    id: 101,
    plate: "R-AB 1234",
    entry_time: "2026-06-05T09:14:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 7.5,
    amount_paid: 0,
  },
  {
    id: 102,
    plate: "M-XY 2024",
    entry_time: "2026-06-17T07:30:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 8.25,
    amount_paid: 0,
  },
  {
    id: 103,
    plate: "B-AA 1001",
    entry_time: "2026-06-17T08:00:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 7.5,
    amount_paid: 0,
  },
  {
    id: 104,
    plate: "B-BC 4455",
    entry_time: "2026-06-17T09:15:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 5.63,
    amount_paid: 0,
  },
  {
    id: 105,
    plate: "M-AB 7788",
    entry_time: "2026-06-17T10:30:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 3.75,
    amount_paid: 0,
  },
  {
    id: 106,
    plate: "N-PQ 7711",
    entry_time: "2026-06-17T11:00:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 3.0,
    amount_paid: 0,
  },
  {
    id: 107,
    plate: "N-RS 8822",
    entry_time: "2026-06-17T12:30:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 0.75,
    amount_paid: 0,
  },
  {
    id: 108,
    plate: "S-PK 800",
    entry_time: "2026-06-17T13:00:00",
    exit_time: null,
    payment_time: null,
    exit_valid_until: null,
    amount_due: 0.0,
    amount_paid: 0,
  },
];

const parkingSpots: ParkingSpot[] = [
  // Floor 1 (EG) — Spots 1–10
  { id: 1,  floor: 1, spot_number: 1,  sensor_id: "SEN-1-01", occupied: true,  last_update: "2026-06-17T07:31:00" },
  { id: 2,  floor: 1, spot_number: 2,  sensor_id: "SEN-1-02", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 3,  floor: 1, spot_number: 3,  sensor_id: "SEN-1-03", occupied: true,  last_update: "2026-06-17T08:01:00" },
  { id: 4,  floor: 1, spot_number: 4,  sensor_id: "SEN-1-04", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 5,  floor: 1, spot_number: 5,  sensor_id: "SEN-1-05", occupied: true,  last_update: "2026-06-17T09:16:00" },
  { id: 6,  floor: 1, spot_number: 6,  sensor_id: "SEN-1-06", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 7,  floor: 1, spot_number: 7,  sensor_id: "SEN-1-07", occupied: true,  last_update: "2026-06-17T10:31:00" },
  { id: 8,  floor: 1, spot_number: 8,  sensor_id: "SEN-1-08", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 9,  floor: 1, spot_number: 9,  sensor_id: "SEN-1-09", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 10, floor: 1, spot_number: 10, sensor_id: "SEN-1-10", occupied: false, last_update: "2026-06-17T06:00:00" },
  // Floor 2 (1. OG) — Spots 31–40
  { id: 11, floor: 2, spot_number: 31, sensor_id: "SEN-2-31", occupied: true,  last_update: "2026-06-17T11:01:00" },
  { id: 12, floor: 2, spot_number: 37, sensor_id: "SEN-2-37", occupied: true,  last_update: "2026-06-05T13:55:00" },
  { id: 13, floor: 2, spot_number: 32, sensor_id: "SEN-2-32", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 14, floor: 2, spot_number: 33, sensor_id: "SEN-2-33", occupied: true,  last_update: "2026-06-17T12:31:00" },
  { id: 15, floor: 2, spot_number: 34, sensor_id: "SEN-2-34", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 16, floor: 2, spot_number: 35, sensor_id: "SEN-2-35", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 17, floor: 2, spot_number: 36, sensor_id: "SEN-2-36", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 18, floor: 2, spot_number: 38, sensor_id: "SEN-2-38", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 19, floor: 2, spot_number: 39, sensor_id: "SEN-2-39", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 20, floor: 2, spot_number: 40, sensor_id: "SEN-2-40", occupied: false, last_update: "2026-06-17T06:00:00" },
  // Floor 3 (2. OG) — Spots 61–70
  { id: 21, floor: 3, spot_number: 61, sensor_id: "SEN-3-61", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 22, floor: 3, spot_number: 62, sensor_id: "SEN-3-62", occupied: true,  last_update: "2026-06-17T13:01:00" },
  { id: 23, floor: 3, spot_number: 63, sensor_id: "SEN-3-63", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 24, floor: 3, spot_number: 64, sensor_id: "SEN-3-64", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 25, floor: 3, spot_number: 65, sensor_id: "SEN-3-65", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 26, floor: 3, spot_number: 66, sensor_id: "SEN-3-66", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 27, floor: 3, spot_number: 67, sensor_id: "SEN-3-67", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 28, floor: 3, spot_number: 68, sensor_id: "SEN-3-68", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 29, floor: 3, spot_number: 69, sensor_id: "SEN-3-69", occupied: false, last_update: "2026-06-17T06:00:00" },
  { id: 30, floor: 3, spot_number: 70, sensor_id: "SEN-3-70", occupied: false, last_update: "2026-06-17T06:00:00" },
];

// Maps session ID → parking spot ID
const sessionSpotMap: Record<number, number> = {
  101: 12,
  102: 1,
  103: 3,
  104: 5,
  105: 7,
  106: 11,
  107: 14,
  108: 22,
};

const eventTypes: EventType[] = [
  { id: 1, name: "entry_detected",  description: "Fahrzeug wurde beim Einfahren erkannt." },
  { id: 2, name: "spot_occupied",   description: "Parkplatz wurde als belegt markiert." },
  { id: 3, name: "payment_complete",description: "Zahlung wurde erfolgreich abgeschlossen." },
  { id: 4, name: "exit_detected",   description: "Fahrzeug wurde beim Ausfahren erkannt." },
];

const eventLogs: EventLog[] = [
  { id: 1001, timestamp: "2026-06-05T09:14:03", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen R-AB 1234 wurde registriert.",            parking_session_id: 101 },
  { id: 1002, timestamp: "2026-06-05T09:15:10", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 2-37 wurde als belegt markiert.",                             parking_session_id: 101 },
  { id: 1003, timestamp: "2026-06-17T07:30:05", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen M-XY 2024 wurde registriert.",            parking_session_id: 102 },
  { id: 1004, timestamp: "2026-06-17T07:31:12", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 1-1 wurde als belegt markiert.",                              parking_session_id: 102 },
  { id: 1005, timestamp: "2026-06-17T08:00:08", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen B-AA 1001 wurde registriert.",            parking_session_id: 103 },
  { id: 1006, timestamp: "2026-06-17T08:01:20", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 1-3 wurde als belegt markiert.",                              parking_session_id: 103 },
  { id: 1007, timestamp: "2026-06-17T09:15:02", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen B-BC 4455 wurde registriert.",            parking_session_id: 104 },
  { id: 1008, timestamp: "2026-06-17T09:16:15", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 1-5 wurde als belegt markiert.",                              parking_session_id: 104 },
  { id: 1009, timestamp: "2026-06-17T10:30:04", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen M-AB 7788 wurde registriert.",            parking_session_id: 105 },
  { id: 1010, timestamp: "2026-06-17T10:31:09", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 1-7 wurde als belegt markiert.",                              parking_session_id: 105 },
  { id: 1011, timestamp: "2026-06-17T11:00:01", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen N-PQ 7711 wurde registriert.",            parking_session_id: 106 },
  { id: 1012, timestamp: "2026-06-17T11:01:18", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 2-31 wurde als belegt markiert.",                             parking_session_id: 106 },
  { id: 1013, timestamp: "2026-06-17T12:30:06", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen N-RS 8822 wurde registriert.",            parking_session_id: 107 },
  { id: 1014, timestamp: "2026-06-17T12:31:22", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 2-33 wurde als belegt markiert.",                             parking_session_id: 107 },
  { id: 1015, timestamp: "2026-06-17T13:00:03", event_type_id: 1, source: "entry_camera",    message: "Einfahren erkannt. Kennzeichen S-PK 800 wurde registriert.",             parking_session_id: 108 },
  { id: 1016, timestamp: "2026-06-17T13:01:11", event_type_id: 2, source: "spot_sensor",     message: "Parkplatz 3-62 wurde als belegt markiert.",                             parking_session_id: 108 },
];

let nextEventLogId = 1017;

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function getPaymentSessionDetailsByPlate(
  plate: string,
): PaymentSessionDetails | null {
  const normalizedPlate = normalizePlate(plate);
  const parkingSession = parkingSessions.find(
    (session) => normalizePlate(session.plate) === normalizedPlate,
  );

  if (!parkingSession) {
    return null;
  }

  const spotId = sessionSpotMap[parkingSession.id];
  const parkingSpot = spotId !== undefined
    ? parkingSpots.find((spot) => spot.id === spotId) ?? null
    : null;

  const events = eventLogs
    .filter((event) => event.parking_session_id === parkingSession.id)
    .map((event) => ({
      ...event,
      eventType:
        eventTypes.find((eventType) => eventType.id === event.event_type_id) ?? null,
    }));

  return {
    parkingSession,
    parkingSpot,
    events,
  };
}

export function markParkingSessionAsPaid(plate: string) {
  const normalizedPlate = normalizePlate(plate);
  const parkingSession = parkingSessions.find(
    (session) => normalizePlate(session.plate) === normalizedPlate,
  );

  if (!parkingSession) {
    return null;
  }

  const amountDue = parkingSession.amount_due ?? 0;
  const paymentTime = new Date();
  const exitValidUntil = new Date(paymentTime.getTime() + 15 * 60 * 1000);

  parkingSession.payment_time = paymentTime.toISOString();
  parkingSession.exit_valid_until = exitValidUntil.toISOString();
  parkingSession.amount_paid = amountDue;
  parkingSession.amount_due = 0;

  eventLogs.push({
    id: nextEventLogId,
    timestamp: paymentTime.toISOString(),
    event_type_id: 3,
    source: "payment_terminal",
    message: `Zahlung erfolgreich. Ausfahrt gültig bis ${exitValidUntil.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    })}.`,
    parking_session_id: parkingSession.id,
  });
  nextEventLogId += 1;

  return parkingSession;
}

export function getAllParkingSpots(): ParkingSpot[] {
  return [...parkingSpots].sort(
    (a, b) => a.floor - b.floor || a.spot_number - b.spot_number,
  );
}

export function getActiveParkingSessions(): ParkingSession[] {
  return parkingSessions.filter((s) => !s.exit_time);
}

export function getSpotForSession(sessionId: number): ParkingSpot | null {
  const spotId = sessionSpotMap[sessionId];
  return spotId !== undefined
    ? parkingSpots.find((s) => s.id === spotId) ?? null
    : null;
}

export function getAllEventLogs(): Array<EventLog & { eventType: EventType | null }> {
  return [...eventLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((event) => ({
      ...event,
      eventType: eventTypes.find((et) => et.id === event.event_type_id) ?? null,
    }));
}
