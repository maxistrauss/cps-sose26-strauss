export type ParkingSession = {
  id: number;
  plate: string;
  entry_time: string;
  exit_time: string | null;
  payment_time: string | null;
  exit_valid_until: string | null;
  amount_due: number | null;
  amount_paid: number;
};

export type ParkingSpot = {
  id: number;
  floor: number;
  spot_number: number;
  sensor_id: string | null;
  occupied: boolean;
  last_update: string;
};

export type EventType = {
  id: number;
  name: string;
  description: string;
};

export type EventLog = {
  id: number;
  timestamp: string;
  event_type_id: number;
  source: string | null;
  message: string;
  parking_session_id: number | null;
};

export type PaymentSessionDetails = {
  parkingSession: ParkingSession;
  parkingSpot: ParkingSpot | null;
  events: Array<
    EventLog & {
      eventType: EventType | null;
    }
  >;
};
