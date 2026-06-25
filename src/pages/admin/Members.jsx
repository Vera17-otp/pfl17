import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useMembers } from "../../hooks/useMembers";
import { useSearch } from "../../hooks/useSearch";
import { ImSpinner2 } from "react-icons/im";
import {
  FaSearch, FaEdit, FaTrash, FaTimes, FaCheck,
  FaUsers, FaExclamationTriangle, FaUserPlus
} from "react-icons/fa";

// ── Membership badge colors ───────────────────────────────────────────────────
const membershipColors = {
  Regular:  { bg: "#E2E8F0", text: "#475569" },
  Silver:   { bg: "#F1F5F9", text: "#64748B" },
  Gold:     { bg: "#FEF3C7", text: "#92400E" },
  Platinum: { bg: "#EDE9FE", text: "#5B21B6" },
};

function MembershipBadge({ type }) {
  const cfg = membershipColors[type] || membershipColors.Regular;
  return (
    <span style={{
      backgroundColor: cfg.bg, color: cfg.text,
      padding: "3px 10px", borderRadius: "99px",
      fontSize: "0.72rem", fontWeight: 700,
    }}>
      {type || "Regular"}
    </span>
  );
}

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div style={{
      width: "38px", height: "38px", borderRadius: "50%",
      backgroundColor: "#1E3A5F", color: "#C9A84C",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: "0.8rem", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: member.full_name || "",
    phone_number: member.phone_number || "",
    address: member.address || "",
    avatar_url: member.avatar_url || "",
    membership_type: member.membership_type || "Regular",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.full_name.trim()) { setError("Nama lengkap wajib diisi."); return; }
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("members")
      .update({
        full_name: form.full_name,
        phone_number: form.phone_number,
        address: form.address,
        avatar_url: form.avatar_url || null,
        membership_type: form.membership_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (updateError) {
      setError("Gagal memperbarui data. Silakan coba lagi.");
      setSaving(false);
      return;
    }

    onSave({ ...member, ...form, updated_at: new Date().toISOString() });
    onClose();
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid #E2E8F0", backgroundColor: "#F8FAFC",
    color: "#1E293B", fontSize: "0.88rem", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    color: "#64748B", marginBottom: "5px", textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: "20px", padding: "32px",
        width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1E293B", margin: 0 }}>
            Edit Anggota
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: "1.2rem" }}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.83rem", color: "#DC2626" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nama Lengkap *</label>
            <input type="text" value={form.full_name} onChange={e => set("full_name", e.target.value)} style={inputStyle} disabled={saving} />
          </div>
          <div>
            <label style={labelStyle}>Nomor HP</label>
            <input type="tel" value={form.phone_number} onChange={e => set("phone_number", e.target.value)} style={inputStyle} disabled={saving} />
          </div>
          <div>
            <label style={labelStyle}>Alamat</label>
            <textarea value={form.address} onChange={e => set("address", e.target.value)} style={{ ...inputStyle, resize: "none" }} rows={2} disabled={saving} />
          </div>
          <div>
            <label style={labelStyle}>Avatar URL</label>
            <input type="text" placeholder="https://..." value={form.avatar_url} onChange={e => set("avatar_url", e.target.value)} style={inputStyle} disabled={saving} />
          </div>
          <div>
            <label style={labelStyle}>Tipe Keanggotaan</label>
            <select value={form.membership_type} onChange={e => set("membership_type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} disabled={saving}>
              {["Regular", "Silver", "Gold", "Platinum"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={onClose} disabled={saving}
              style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit" }}>
              Batal
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #1E3A5F, #2E5490)", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.88rem", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: saving ? 0.8 : 1 }}>
              {saving ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><FaCheck /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ member, onClose, onConfirm, deleting }) {
  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: "20px", padding: "32px",
        width: "100%", maxWidth: "400px", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.6rem" }}>
          <FaExclamationTriangle style={{ color: "#EF4444" }} />
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1E293B", margin: "0 0 8px" }}>
          Hapus Anggota
        </h3>
        <p style={{ fontSize: "0.88rem", color: "#6B7280", margin: "0 0 24px", lineHeight: 1.6 }}>
          Apakah Anda yakin ingin menghapus profil <strong>{member.full_name}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onClose} disabled={deleting}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit" }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontSize: "0.88rem", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: deleting ? 0.8 : 1 }}>
            {deleting ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><FaTrash /> Hapus</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Members Page ─────────────────────────────────────────────────────────
export default function Members() {
  const { members, loading, error: fetchError, fetchMembers, updateMember, removeMember } = useMembers();
  const { searchTerm: search, setSearchTerm: setSearch, debouncedTerm } = useSearch("", 300);

  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchMembers(debouncedTerm);
  }, [debouncedTerm, fetchMembers]);

  async function handleDelete() {
    if (!deletingMember) return;
    setDeleting(true);

    const { error } = await removeMember(deletingMember.id);

    setDeleting(false);
    if (error) {
      showToast("Gagal menghapus anggota", "error");
    } else {
      showToast("Anggota berhasil dihapus");
      setDeletingMember(null);
    }
  }

  async function handleSaveMember(updated) {
    const { error } = await updateMember(updated.id, updated);
    if (error) {
      showToast("Gagal memperbarui data anggota.", "error");
    } else {
      showToast("Data anggota berhasil diperbarui.");
    }
    setEditingMember(null);
  }

  const filtered = members.filter(m =>
    (m.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.phone_number || "").includes(search) ||
    (m.membership_type || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          backgroundColor: toast.type === "error" ? "#EF4444" : "#10B981",
          color: "#fff", padding: "12px 20px", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999,
          fontSize: "0.88rem", fontWeight: 600,
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
            <FaUsers style={{ color: "#1E3A5F" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1E293B", margin: 0 }}>Manajemen Anggota</h1>
            <p style={{ fontSize: "0.8rem", color: "#94A3B8", margin: "2px 0 0" }}>{members.length} total anggota terdaftar</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
          <input
            type="text"
            placeholder="Cari nama, HP, atau tier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "10px 14px 10px 36px", borderRadius: "10px",
              border: "1.5px solid #E2E8F0", backgroundColor: "#F8FAFC",
              color: "#1E293B", fontSize: "0.85rem", outline: "none",
              fontFamily: "inherit", width: "240px",
            }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <ImSpinner2 style={{ animation: "spin 1s linear infinite", fontSize: "2rem", color: "#1E3A5F" }} />
          <p style={{ marginTop: "12px", color: "#94A3B8", fontSize: "0.88rem" }}>Memuat data anggota...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#EF4444", marginBottom: "12px" }} />
          <p style={{ color: "#EF4444", fontWeight: 600, marginBottom: "12px" }}>{fetchError}</p>
          <button onClick={fetchMembers}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#1E3A5F", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.88rem" }}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #F0EAE0" }}>
          <FaUserPlus style={{ fontSize: "2.5rem", color: "#94A3B8", marginBottom: "12px" }} />
          <p style={{ color: "#64748B", fontWeight: 600, fontSize: "1rem" }}>
            {search ? "Tidak ada anggota yang cocok dengan pencarian." : "Belum ada anggota terdaftar."}
          </p>
          {search && (
            <button onClick={() => setSearch("")}
              style={{ marginTop: "12px", padding: "8px 18px", borderRadius: "10px", border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.83rem" }}>
              Hapus Pencarian
            </button>
          )}
        </div>
      )}

      {/* Members Table */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #F0EAE0", overflow: "hidden", boxShadow: "0 2px 12px rgba(30,58,95,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  {["Anggota", "No. HP", "Alamat", "Tier", "Bergabung", "Diperbarui", "Aksi"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr key={m.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #F1F5F9" : "none", transition: "background-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FAFBFC"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* Anggota */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.full_name} style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <Avatar name={m.full_name} />
                        )}
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#1E293B", fontSize: "0.88rem" }}>{m.full_name || "-"}</p>
                          <p style={{ margin: "1px 0 0", fontSize: "0.72rem", color: "#94A3B8" }}>ID #{m.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#475569", whiteSpace: "nowrap" }}>
                      {m.phone_number || "-"}
                    </td>

                    {/* Address */}
                    <td style={{ padding: "14px 16px", fontSize: "0.83rem", color: "#64748B", maxWidth: "180px" }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {m.address || "-"}
                      </span>
                    </td>

                    {/* Membership */}
                    <td style={{ padding: "14px 16px" }}>
                      <MembershipBadge type={m.membership_type} />
                    </td>

                    {/* Joined */}
                    <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#94A3B8", whiteSpace: "nowrap" }}>
                      {formatDate(m.joined_at)}
                    </td>

                    {/* Updated */}
                    <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#94A3B8", whiteSpace: "nowrap" }}>
                      {formatDate(m.updated_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setEditingMember(m)}
                          title="Edit"
                          style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "#F8FAFC", color: "#1E3A5F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EFF6FF"; e.currentTarget.style.borderColor = "#1E3A5F"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setDeletingMember(m)}
                          title="Hapus"
                          style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1.5px solid #FEE2E2", backgroundColor: "#FFF5F5", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEE2E2"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFF5F5"; }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFBFC" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#94A3B8" }}>
              Menampilkan <strong>{filtered.length}</strong> dari <strong>{members.length}</strong> anggota
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingMember && (
        <EditModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
        />
      )}

      {deletingMember && (
        <DeleteModal
          member={deletingMember}
          onClose={() => setDeletingMember(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} } @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
