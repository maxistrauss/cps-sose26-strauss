import { useState, useEffect, useCallback, useRef } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type UseFetchResult<T> = FetchState<T> & { refetch: () => void };

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  { pollingMs }: { pollingMs?: number } = {},
): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Always keep the latest fetchFn in a ref so the stable `run` callback
  // uses the current closure (e.g. current filter state) without re-subscribing effects.
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;

  const run = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fnRef.current().then(
      (data) => setState({ data, loading: false, error: null }),
      (err: unknown) =>
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Fehler beim Laden",
        })),
    );
  }, []);

  useEffect(() => {
    run();
    if (!pollingMs) return;
    const id = window.setInterval(run, pollingMs);
    return () => window.clearInterval(id);
  }, [run, pollingMs]);

  return { ...state, refetch: run };
}
