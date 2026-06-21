const SUPABASE_FETCH_TIMEOUT_MS = 8_000;
const SUPABASE_MIDDLEWARE_FETCH_TIMEOUT_MS = 4_000;

function createBoundedFetch(timeoutMs: number) {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const signal = init?.signal ?? AbortSignal.timeout(timeoutMs);
    return fetch(input, { ...init, signal });
  };
}

/** Bounded fetch for Supabase clients — fails fast instead of hanging middleware/UI. */
export const supabaseFetch = createBoundedFetch(SUPABASE_FETCH_TIMEOUT_MS);

/** Shorter timeout for edge middleware so public pages are not blocked as long. */
export const supabaseMiddlewareFetch = createBoundedFetch(SUPABASE_MIDDLEWARE_FETCH_TIMEOUT_MS);

export const supabaseClientOptions = {
  global: {
    fetch: supabaseFetch,
  },
} as const;

export const supabaseMiddlewareClientOptions = {
  global: {
    fetch: supabaseMiddlewareFetch,
  },
} as const;
