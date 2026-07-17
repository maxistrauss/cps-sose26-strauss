// MAP endpoints
export type ApiParkingSpot = {
  id: number;
  floor: number;
  spot_number: number;
  occupied: boolean;
};

export type MapOverview = {
  total_spots: number;
  free_spots: number;
  occupied_spots: number;
};

// PAYMENTS endpoints
export type OpenSession = {
  session_id: number;
  plate: string;
  entry_time: string;
  amount_due: number;
  amount_paid: number;
  remaining_amount: number;
};

export type SessionByPlate = {
  session_id: number;
  plate: string;
  entry_time: string;
  amount_due: number;
  amount_paid: number;
  remaining_amount: number;
};

// Response von PATCH /api/payments/session/:sessionId
export type PatchPaymentResult = {
  success: boolean;
  session_id: number;
  plate: string;
  amount_due: number;
  amount_paid: number;
  payment_time: string | null;
  exit_valid_until: string | null;
};

// ADMIN endpoints
export type ApiEventLog = {
  id: number;
  timestamp: string;
  eventtype: string;
  source: string | null;
  message: string;
  parking_session_id: number | null;
};

export type AdminSession = {
  id: number;
  plate: string;
  entry_time: string;
  amount_due: number;
  amount_paid: number;
};

export type AdminSessionDetail = AdminSession & {
  payment_time: string | null;
  exit_time: string | null;
  exit_valid_until: string | null;
};

export type RfidAdmin = {
  id: number;
  name: string;
  rfid_uid: string;
  role: string;
  active: boolean;
};

export type RfidRelease = {
  id: number;
  admin_id: number;
  admin_name: string;
  rfid_uid: string;
  parking_session_id: number | null;
  release_time: string;
};
