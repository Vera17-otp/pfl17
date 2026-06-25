import { supabase } from "./supabase";

/**
 * Service layer untuk data member.
 * Tabel members menggunakan kolom:
 * id, user_id, full_name, phone_number, address,
 * avatar_url, membership_type, joined_at, updated_at
 */
export const memberService = {
  /**
   * Ambil semua member.
   * Bisa mencari berdasarkan nama, nomor HP, atau tipe membership.
   */
  async getAll(searchQuery = "") {
    try {
      let query = supabase
        .from("members")
        .select(`
          id,
          user_id,
          full_name,
          phone_number,
          address,
          avatar_url,
          membership_type,
          joined_at,
          updated_at
        `)
        .order("joined_at", { ascending: false });

      if (searchQuery.trim()) {
        const keyword = searchQuery.trim();

        query = query.or(
          `full_name.ilike.%${keyword}%,phone_number.ilike.%${keyword}%,membership_type.ilike.%${keyword}%`
        );
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Ambil satu member berdasarkan user_id dari Supabase Auth.
   */
  async getByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          user_id,
          full_name,
          phone_number,
          address,
          avatar_url,
          membership_type,
          joined_at,
          updated_at
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Ambil satu member berdasarkan id tabel members.
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("members")
        .select(`
          id,
          user_id,
          full_name,
          phone_number,
          address,
          avatar_url,
          membership_type,
          joined_at,
          updated_at
        `)
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Buat profil member baru.
   * user_id wajib berasal dari Supabase Auth.
   */
  async create({
    user_id,
    full_name,
    phone_number = "",
    address = "",
    avatar_url = "",
    membership_type = "Regular",
  }) {
    try {
      const { data, error } = await supabase
        .from("members")
        .insert({
          user_id,
          full_name: full_name.trim(),
          phone_number: phone_number.trim(),
          address: address.trim(),
          avatar_url: avatar_url.trim(),
          membership_type,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          id,
          user_id,
          full_name,
          phone_number,
          address,
          avatar_url,
          membership_type,
          joined_at,
          updated_at
        `)
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Update data member berdasarkan id.
   */
  async update(id, updates) {
    try {
      const payload = {
        updated_at: new Date().toISOString(),
      };

      if (updates.full_name !== undefined) {
        payload.full_name = updates.full_name.trim();
      }

      if (updates.phone_number !== undefined) {
        payload.phone_number = updates.phone_number.trim();
      }

      if (updates.address !== undefined) {
        payload.address = updates.address.trim();
      }

      if (updates.avatar_url !== undefined) {
        payload.avatar_url = updates.avatar_url.trim();
      }

      if (updates.membership_type !== undefined) {
        payload.membership_type = updates.membership_type;
      }

      const { data, error } = await supabase
        .from("members")
        .update(payload)
        .eq("id", id)
        .select(`
          id,
          user_id,
          full_name,
          phone_number,
          address,
          avatar_url,
          membership_type,
          joined_at,
          updated_at
        `)
        .single();

      if (error) throw new Error(error.message);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Hapus member berdasarkan id.
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },
};