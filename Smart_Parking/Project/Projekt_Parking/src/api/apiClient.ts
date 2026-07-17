const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:1880";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        ...(options?.body != null ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
      ...options,
    });
  } catch {
    throw new ApiError(0, "Server nicht erreichbar.");
  }

  const text = await response.text();

  if (!response.ok) {
    let body: { error?: string } = {};
    try { body = JSON.parse(text) as { error?: string }; } catch { /* HTML-Fehlerseite */ }
    throw new ApiError(response.status, body.error ?? `HTTP ${response.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(0, "Server hat kein JSON geantwortet — Proxy oder Pi-Verbindung prüfen");
  }
}
