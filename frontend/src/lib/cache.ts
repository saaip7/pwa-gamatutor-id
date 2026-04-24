interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

export function createCachedFetch<T>(
  fetcher: () => Promise<T>,
  maxAgeMs: number
) {
  let cache: CacheEntry<T> | null = null;
  let inflight: Promise<T> | null = null;

  return async (forceRefresh = false): Promise<T> => {
    if (inflight) return inflight;

    if (!forceRefresh && cache && Date.now() - cache.fetchedAt < maxAgeMs) {
      return cache.data;
    }

    inflight = fetcher()
      .then((data) => {
        cache = { data, fetchedAt: Date.now() };
        inflight = null;
        return data;
      })
      .catch((err) => {
        inflight = null;
        if (cache) return cache.data;
        throw err;
      });

    return inflight;
  };
}
