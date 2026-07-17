import type { ApiParkingSpot, MapOverview } from "./types";

// MOCK-DATEN — nur für Screenshots/Dokumentation, kein Backend angebunden.
const MOCK_PARKING_SPOTS: ApiParkingSpot[] = [
  { id: 1, floor: 1, spot_number: 1, occupied: true },
  { id: 2, floor: 1, spot_number: 2, occupied: false },
  { id: 3, floor: 1, spot_number: 3, occupied: false },
];

const MOCK_MAP_OVERVIEW: MapOverview = {
  total_spots: 3,
  free_spots: 2,
  occupied_spots: 1,
};

export function fetchParkingSpots(): Promise<ApiParkingSpot[]> {
  return Promise.resolve(MOCK_PARKING_SPOTS);
}

export function fetchMapOverview(): Promise<MapOverview> {
  return Promise.resolve(MOCK_MAP_OVERVIEW);
}
