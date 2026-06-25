import { useState, useCallback } from "react";
import { memberService } from "../lib/supabaseService";

/**
 * useMembers Hook
 * Encapsulates all data fetching and mutations for the `members` table.
 */
export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async (searchQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await memberService.getAll(searchQuery);
      if (fetchError) throw fetchError;
      setMembers(data || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = async (profileData) => {
    const { data, error } = await memberService.create(profileData);
    if (!error && data) {
      setMembers((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const updateMember = async (id, updates) => {
    const { data, error } = await memberService.update(id, updates);
    if (!error && data) {
      setMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
    }
    return { data, error };
  };

  const removeMember = async (id) => {
    const { error } = await memberService.delete(id);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
    return { error };
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    removeMember
  };
}
