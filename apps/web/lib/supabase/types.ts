export type SupabaseCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export type SupabaseCookieMethods = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookiesToSet: SupabaseCookie[]) => void;
};
