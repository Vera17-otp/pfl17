import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * useMembers Hook
 * Encapsulates all data fetching and mutations for the `profiles` table.
 */
export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async (searchQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("profiles")
        .select("*, member_tiers(*)")
        .order("created_at", { ascending: false });

      if (searchQuery.trim()) {
        const kw = searchQuery.trim();
        query = query.or(`full_name.ilike.%${kw}%,email.ilike.%${kw}%,phone.ilike.%${kw}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMember = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select("*, member_tiers(*)")
        .single();
      if (error) throw error;
      setMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
      return { data, error: null };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { data: null, error: err };
    }
  };

  const removeMember = async (id) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== id));
      return { error: null };
    } catch (err) {
      console.error("Error deleting profile:", err);
      return { error: err };
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    updateMember,
    removeMember
  };
}

