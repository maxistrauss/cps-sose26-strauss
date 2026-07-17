import { apiFetch } from "./apiClient";
import type { ApiParkingSpot, MapOverview } from "./types";

export function fetchParkingSpots(): Promise<ApiParkingSpot[]> {
  return apiFetch<ApiParkingSpot[]>("/api/map/parking-spots");
}

export function fetchMapOverview(): Promise<MapOverview> {
  return apiFetch<MapOverview>("/api/map/overview");
}
