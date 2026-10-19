import { useCallback, useEffect, useState } from 'react';

export type Availability = Record<'concrete' | 'white' | 'both', Record<string, boolean>>;

interface Result {
  availability: Availability | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// TODO Phase 2: replace body with fetch(`/api/availability?date=${dateISO}`).
// For now returns null so the UI treats all slots as available — the design
// renders correctly while the Google Calendar integration is being built.
export function useAvailability(dateISO: string): Result {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    // Placeholder: simulate a fast response.
    window.setTimeout(() => setLoading(false), 150);
  }, []);

  useEffect(() => { retry(); }, [dateISO, retry]);

  return { availability: null, loading, error, retry };
}