import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * useAuth Hook
 * Provides an easy interface for Supabase Authentication state.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile(userId) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*, member_tiers(*)")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Error fetching user profile:", err);
        return null;
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await getProfile(session.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await getProfile(session.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, metadata) => supabase.auth.signUp({ email, password, options: { data: metadata } });
  const signOut = () => supabase.auth.signOut();

  return { session, user, profile, loading, signIn, signUp, signOut };
}

