import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiData<T>(url: string | null): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    loading: url !== null,
    error: null,
  });

  useEffect(() => {
    if (url === null) return;

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    api
      .get<T>(url)
      .then((response) => {
        if (!cancelled) setState({ data: response.data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load data";
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
