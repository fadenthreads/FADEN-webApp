"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@faden/types";
import { createBrowserClient, isBrowserSupabaseConfigured } from "@/lib/supabase/client";

export interface UserState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useUser(): UserState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBrowserSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let supabase: ReturnType<typeof createBrowserClient>;

    try {
      supabase = createBrowserClient();
    } catch {
      setLoading(false);
      return;
    }

    async function loadProfile(authUser: User | null) {
      if (!authUser) {
        if (mounted) setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (error) {
          if (mounted) setProfile(null);
          return;
        }

        if (mounted) setProfile((data as Profile | null) ?? null);
      } catch {
        if (mounted) setProfile(null);
      }
    }

    async function init() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        if (!mounted) return;
        const authUser = session?.user ?? null;
        setUser(authUser);
        await loadProfile(authUser);
      } catch {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!mounted) return;
        try {
          const authUser = session?.user ?? null;
          setUser(authUser);
          await loadProfile(authUser);
        } catch {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}

export function getUserInitial(user: User | null, profile: Profile | null): string {
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email || "";
  return (name.trim()[0] ?? "U").toUpperCase();
}
