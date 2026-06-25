import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * useAuth Hook
 * Provides an easy interface for Supabase Authentication state.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, metadata) => supabase.auth.signUp({ email, password, options: { data: metadata } });
  const signOut = () => supabase.auth.signOut();

  return { session, user, loading, signIn, signUp, signOut };
}
