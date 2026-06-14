import React, { useState, useMemo, useCallback } from "react";
import {
  FaTasks, FaPlus, FaTimes, FaSearch, FaFilter,
  FaChevronRight, FaChevronDown, FaCheck, FaTrash,
  FaEdit, FaUser, FaClock, FaBed, FaChartBar,
  FaExclamationTriangle, FaThLarge, FaList,
  FaFire, FaSortAmountDown, FaCalendarAlt,
} from "react-icons/fa";
import {
  useTask,
  STAFF_LIST, DEPARTMENTS,
  PRIORITY_CONFIG, STATUS_CONFIG, TASK_STATUSES,
} from "../context/TaskContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDeadline(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d - now;
  const diffH = diffMs / (1000 * 60 * 60);
  const diffD = Math.floor(Math.abs(diffH) / 24);

  if (diffMs < 0) return { text: `${diffD}h ${Math.floor(Math.abs(diffH) % 24)}j terlambat`, overdue: true };
  if (diffH < 1) return { text: `${Math.floor(diffMs / 60000)} menit lagi`, urgent: true };
  if (diffH < 24) return { text: `${Math.floor(diffH)} jam lagi`, ok: true };
  return {
    text: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
          " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    ok: true,
  };
}

function DeadlineBadge({ iso }) {
  if (!iso) return <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>—</span>;
  const dl = formatDeadline(iso);
  const text = typeof dl === "string" ? dl : dl.text;
  const isOverdue = typeof dl === "object" && dl.overdue;
  const isUrgent = typeof dl === "object" && dl.urgent;
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 600,
      color: isOverdue ? "#EF4444" : isUrgent ? "#F59E0B" : "var(--text-muted)",
      display: "flex", alignItems: "center", gap: "3px",
    }}>
      <FaClock style={{ fontSize: "0.6rem" }} />
      {text}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Sedang"];
  return (
    <span style={{
      fontSize: "0.67rem", fontWeight: 700, padding: "2px 7px",
      borderRadius: "99px", backgroundColor: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      animation: priority === "Darurat" ? "pulseRed 1.5s infinite" : "none",
    }}>
      {priority === "Darurat" && "⚡ "}{priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span style={{
      fontSize: "0.67rem", fontWeight: 700, padding: "2px 7px",
      borderRadius: "99px", backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {status}
    </span>
  );
}

function StaffAvatar({ staffId, size = 28 }) {
  const staff = STAFF_LIST.find(s => s.id === staffId);
  if (!staff) return null;
  return (
    <div title={staff.name} style={{
      width: `${size}px`, height: `${size}px`, borderRadius: "50%",
      backgroundColor: "rgba(37,99,235,0.12)", color: "var(--primary-color)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: `${size * 0.33}px`, fontWeight: 700, flexShrink: 0,
    }}>
      {staff.avatar}
    </div>
  );
}

// ── Task Card (Kanban) ─────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const nextStatuses = TASK_STATUSES.filter(s => s !== task.status);

  return (
    <div style={{
      backgroundColor: "var(--surface-color)",
      borderRadius: "12px",
      border: `1px solid ${task.priority === "Darurat" ? "#EF444440" : "var(--border-color)"}`,
      padding: "12px 14px",
      boxShadow: "var(--shadow-sm)",
      position: "relative",
      transition: "box-shadow 0.2s, transform 0.15s",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Header kartu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", lineHeight: "1.35", flex: 1 }}>
          {task.title}
        </p>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", borderRadius: "4px", fontSize: "0.75rem" }} title="Edit">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px", borderRadius: "4px", fontSize: "0.75rem" }} title="Hapus">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Deskripsi */}
      {task.description && (
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "10px", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {task.description}
        </p>
      )}

      {/* Meta info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        <PriorityBadge priority={task.priority} />
        {task.roomRef && (
          <span style={{ fontSize: "0.67rem", fontWeight: 600, padding: "2px 7px", borderRadius: "99px", backgroundColor: "rgba(16,185,129,0.1)", color: "#059669" }}>
            <FaBed style={{ marginRight: "3px" }} />Kamar {task.roomRef}
          </span>
        )}
        {task.source !== "manual" && (
          <span style={{ fontSize: "0.67rem", padding: "2px 7px", borderRadius: "99px", backgroundColor: "rgba(124,58,237,0.1)", color: "#7C3AED", fontWeight: 600 }}>
            {task.source === "auto-checkout" ? "🏃 Auto-Checkout" : "🎫 Auto-Helpdesk"}
          </span>
        )}
      </div>

      {/* Footer: avatar + deadline + ubah status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StaffAvatar staffId={task.assigneeId} />
          <DeadlineBadge iso={task.deadline} />
        </div>

        {/* Status changer */}
        {task.status !== "Selesai" && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "0.68rem", fontWeight: 700, padding: "4px 8px",
                borderRadius: "7px", cursor: "pointer",
                backgroundColor: "rgba(37,99,235,0.08)", color: "var(--primary-color)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              Ubah <FaChevronDown style={{ fontSize: "0.55rem" }} />
            </button>
            {showMenu && (
              <div style={{
                position: "absolute", bottom: "110%", right: 0,
                backgroundColor: "var(--surface-color)", borderRadius: "10px",
                border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)",
                zIndex: 50, minWidth: "170px", overflow: "hidden",
              }}>
                {nextStatuses.map(s => (
                  <div
                    key={s}
                    onClick={() => { onStatusChange(task.id, s); setShowMenu(false); }}
                    style={{
                      padding: "9px 14px", cursor: "pointer", fontSize: "0.78rem",
                      fontWeight: 600, color: STATUS_CONFIG[s]?.color,
                      display: "flex", alignItems: "center", gap: "8px",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <FaChevronRight style={{ fontSize: "0.6rem" }} /> {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {task.status === "Selesai" && (
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}>
            <FaCheck /> Selesai
          </span>
        )}
      </div>
    </div>
  );
}

// ── Modal Form Tugas ───────────────────────────────────────────────────────────
function TaskFormModal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dept: initialData?.dept || DEPARTMENTS[0],
    assigneeId: initialData?.assigneeId || "",
    priority: initialData?.priority || "Sedang",
    deadline: initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
    roomRef: initialData?.roomRef || "",
  });
  const [errors, setErrors] = useState({});

  const filteredStaff = STAFF_LIST.filter(s => s.dept === form.dept);

  function handleDeptChange(dept) {
    setForm(f => ({ ...f, dept, assigneeId: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    if (!form.assigneeId) e.assigneeId = "Pilih staf";
    if (!form.deadline) e.deadline = "Tenggat wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({ ...form, deadline: new Date(form.deadline).toISOString() });
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1px solid var(--border-color)", outline: "none",
    backgroundColor: "var(--bg-color)", color: "var(--text-main)",
    fontSize: "0.85rem", fontFamily: "inherit",
  };
  const labelStyle = { fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "5px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };
  const errorStyle = { fontSize: "0.72rem", color: "#EF4444", marginTop: "3px" };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "var(--surface-color)", borderRadius: "16px", width: "90%", maxWidth: "520px", boxShadow: "var(--shadow-lg)", overflow: "hidden", animation: "fadeIn 0.2s ease" }}>
        {/* Header Modal */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(37,99,235,0.03)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
            {initialData ? "✏️ Edit Tugas" : "📋 Buat Tugas Baru"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1rem" }}>
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
          {/* Judul */}
          <div>
            <label style={labelStyle}>Judul Tugas *</label>
            <input style={{ ...inputStyle, borderColor: errors.title ? "#EF4444" : "var(--border-color)" }}
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Contoh: Bersihkan Kamar 201..." />
            {errors.title && <div style={errorStyle}>{errors.title}</div>}
          </div>

          {/* Deskripsi */}
          <div>
            <label style={labelStyle}>Deskripsi</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detail pekerjaan yang perlu dilakukan..." />
          </div>

          {/* Departemen + Staf */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Departemen *</label>
              <select style={inputStyle} value={form.dept} onChange={e => handleDeptChange(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Staf Ditugaskan *</label>
              <select style={{ ...inputStyle, borderColor: errors.assigneeId ? "#EF4444" : "var(--border-color)" }}
                value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
                <option value="">— Pilih Staf —</option>
                {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.assigneeId && <div style={errorStyle}>{errors.assigneeId}</div>}
            </div>
          </div>

          {/* Prioritas */}
          <div>
            <label style={labelStyle}>Prioritas *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Rendah", "Sedang", "Tinggi", "Darurat"].map(p => {
                const cfg = PRIORITY_CONFIG[p];
                const selected = form.priority === p;
                return (
                  <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                    style={{
                      padding: "6px 14px", borderRadius: "99px", cursor: "pointer",
                      fontSize: "0.78rem", fontWeight: 700,
                      backgroundColor: selected ? cfg.color : cfg.bg,
                      color: selected ? "#fff" : cfg.color,
                      border: `2px solid ${cfg.color}`,
                      transition: "all 0.15s",
                    }}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tenggat + Kamar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Tenggat Waktu *</label>
              <input type="datetime-local" style={{ ...inputStyle, borderColor: errors.deadline ? "#EF4444" : "var(--border-color)" }}
                value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              {errors.deadline && <div style={errorStyle}>{errors.deadline}</div>}
            </div>
            <div>
              <label style={labelStyle}>Nomor Kamar (opsional)</label>
              <input style={inputStyle} value={form.roomRef}
                onChange={e => setForm(f => ({ ...f, roomRef: e.target.value }))}
                placeholder="Contoh: 201" />
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "transparent", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "inherit" }}>
            Batal
          </button>
          <button onClick={handleSubmit} className="btn-primary" style={{ padding: "9px 24px", borderRadius: "8px" }}>
            {initialData ? "Simpan Perubahan" : "Buat Tugas"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Konfirmasi Hapus ───────────────────────────────────────────────────────────
function ConfirmDeleteModal({ task, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", zIndex: 3001, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "var(--surface-color)", borderRadius: "14px", width: "90%", maxWidth: "380px", padding: "28px", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🗑️</div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>Hapus Tugas?</h3>
        <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "24px" }}>
          "<strong>{task?.title}</strong>" akan dihapus permanen.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "transparent", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>Batal</button>
          <button onClick={onConfirm} style={{ padding: "9px 22px", borderRadius: "8px", border: "none", backgroundColor: "#EF4444", color: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, fontFamily: "inherit" }}>Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ── BOARD KANBAN ───────────────────────────────────────────────────────────────
function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }) {
  const [activeDept, setActiveDept] = useState("Semua");
  const deptTabs = ["Semua", ...DEPARTMENTS];

  const filtered = useMemo(() =>
    activeDept === "Semua" ? tasks : tasks.filter(t => t.dept === activeDept),
    [tasks, activeDept]
  );

  const columns = TASK_STATUSES.map(status => ({
    status,
    tasks: filtered.filter(t => t.status === status),
  }));

  const colColors = {
    "Belum Dimulai":     { header: "#64748B", bg: "rgba(100,116,139,0.05)" },
    "Sedang Dikerjakan": { header: "#3B82F6", bg: "rgba(59,130,246,0.05)"  },
    "Selesai":           { header: "#10B981", bg: "rgba(16,185,129,0.05)"  },
  };

  return (
    <div>
      {/* Dept tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {deptTabs.map(d => (
          <button key={d} onClick={() => setActiveDept(d)}
            style={{
              padding: "6px 14px", borderRadius: "99px", cursor: "pointer",
              fontSize: "0.78rem", fontWeight: activeDept === d ? 700 : 500,
              backgroundColor: activeDept === d ? "var(--primary-color)" : "var(--surface-color)",
              color: activeDept === d ? "#fff" : "var(--text-muted)",
              border: `1px solid ${activeDept === d ? "var(--primary-color)" : "var(--border-color)"}`,
              transition: "all 0.15s",
            }}>
            {d}
            {d !== "Semua" && (
              <span style={{ marginLeft: "5px", opacity: 0.8 }}>
                ({tasks.filter(t => t.dept === d && t.status !== "Selesai").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3 Kolom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "start" }}>
        {columns.map(col => {
          const cfg = colColors[col.status];
          return (
            <div key={col.status} style={{ backgroundColor: cfg.bg, borderRadius: "14px", border: `1px solid ${cfg.header}20`, overflow: "hidden" }}>
              {/* Kolom header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${cfg.header}30` }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: cfg.header }}>{col.status}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: cfg.header, color: "#fff", borderRadius: "99px", padding: "1px 8px" }}>
                  {col.tasks.length}
                </span>
              </div>
              {/* Kartu */}
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "100px" }}>
                {col.tasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    Tidak ada tugas
                  </div>
                )}
                {col.tasks.map(task => (
                  <TaskCard key={task.id} task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DAFTAR + FILTER ────────────────────────────────────────────────────────────
function TaskListView({ tasks, onEdit, onDelete, onStatusChange }) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const matchDept = !filterDept || t.dept === filterDept;
      const matchStaff = !filterStaff || t.assigneeId === filterStaff;
      const matchPriority = !filterPriority || t.priority === filterPriority;
      const matchStatus = !filterStatus || t.status === filterStatus;
      return matchSearch && matchDept && matchStaff && matchPriority && matchStatus;
    });
  }, [tasks, search, filterDept, filterStaff, filterPriority, filterStatus]);

  const selectStyle = {
    padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)",
    backgroundColor: "var(--surface-color)", color: "var(--text-main)", fontSize: "0.8rem",
    outline: "none", fontFamily: "inherit", cursor: "pointer",
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "8px 12px", flex: "1 1 200px" }}>
          <FaSearch style={{ color: "var(--text-muted)", fontSize: "0.8rem" }} />
          <input type="text" placeholder="Cari judul atau deskripsi…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "0.83rem", color: "var(--text-main)", width: "100%" }} />
        </div>

        <select style={selectStyle} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">Semua Departemen</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select style={selectStyle} value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
          <option value="">Semua Staf</option>
          {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select style={selectStyle} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">Semua Prioritas</option>
          {["Rendah", "Sedang", "Tinggi", "Darurat"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(search || filterDept || filterStaff || filterPriority || filterStatus) && (
          <button onClick={() => { setSearch(""); setFilterDept(""); setFilterStaff(""); setFilterPriority(""); setFilterStatus(""); }}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "transparent", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "inherit" }}>
            Reset Filter
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="table-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "rgba(37,99,235,0.03)" }}>
                {["Judul", "Departemen", "Staf", "Prioritas", "Status", "Tenggat", "Kamar", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-color)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Tidak ada tugas yang sesuai filter.
                  </td>
                </tr>
              )}
              {filtered.map((task, idx) => {
                const staff = STAFF_LIST.find(s => s.id === task.assigneeId);
                return (
                  <tr key={task.id} style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(37,99,235,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)"}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-main)" }}>{task.title}</div>
                      {task.source !== "manual" && <span style={{ fontSize: "0.66rem", color: "#7C3AED" }}>{task.source === "auto-checkout" ? "🏃 Auto" : "🎫 Helpdesk"}</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{task.dept}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <StaffAvatar staffId={task.assigneeId} size={26} />
                        <span style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{staff?.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><PriorityBadge priority={task.priority} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: STATUS_CONFIG[task.status]?.bg, color: STATUS_CONFIG[task.status]?.color, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
                        {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px" }}><DeadlineBadge iso={task.deadline} /></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "var(--text-muted)" }}>{task.roomRef || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => onEdit(task)} style={{ background: "none", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.8rem" }} title="Edit"><FaEdit /></button>
                        <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "1px solid #EF444430", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#EF4444", fontSize: "0.8rem" }} title="Hapus"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-color)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Menampilkan {filtered.length} dari {tasks.length} tugas
        </div>
      </div>
    </div>
  );
}

// ── LAPORAN PRODUKTIVITAS ──────────────────────────────────────────────────────
function ProductivityReport() {
  const { getProductivityStats } = useTask();
  const [period, setPeriod] = useState("week");
  const stats = getProductivityStats(period);
  const maxCompleted = Math.max(...stats.map(s => s.completedInPeriod), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Toggle */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[{ key: "today", label: "Hari Ini" }, { key: "week", label: "Minggu Ini" }].map(opt => (
          <button key={opt.key} onClick={() => setPeriod(opt.key)}
            style={{
              padding: "7px 18px", borderRadius: "99px", cursor: "pointer", fontSize: "0.82rem", fontWeight: period === opt.key ? 700 : 500,
              backgroundColor: period === opt.key ? "var(--primary-color)" : "var(--surface-color)",
              color: period === opt.key ? "#fff" : "var(--text-muted)",
              border: `1px solid ${period === opt.key ? "var(--primary-color)" : "var(--border-color)"}`,
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        {[
          { label: "Total Tugas Aktif", value: stats.reduce((a, s) => a + s.active, 0), color: "#3B82F6" },
          { label: "Tugas Selesai", value: stats.reduce((a, s) => a + s.completedInPeriod, 0), color: "#10B981" },
          { label: "Rata-rata per Staf", value: (stats.reduce((a, s) => a + s.completedInPeriod, 0) / stats.length).toFixed(1), color: "#F59E0B" },
          { label: "Staf Paling Produktif", value: stats.sort((a, b) => b.completedInPeriod - a.completedInPeriod)[0]?.name?.split(" ")[0] || "—", color: "#7C3AED", isText: true },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontSize: kpi.isText ? "1.1rem" : "1.8rem", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart Horizontal */}
      <div className="table-card" style={{ padding: "20px" }}>
        <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "18px" }}>
          <FaChartBar style={{ marginRight: "8px", color: "var(--primary-color)" }} />
          Produktivitas Staf — Tugas Selesai ({period === "today" ? "Hari Ini" : "7 Hari Terakhir"})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[...stats].sort((a, b) => b.completedInPeriod - a.completedInPeriod).map(s => {
            const pct = maxCompleted > 0 ? (s.completedInPeriod / maxCompleted) * 100 : 0;
            return (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <StaffAvatar staffId={s.id} size={24} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{s.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>({s.dept})</span>
                  </div>
                  <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>{s.completedInPeriod} selesai</span>
                    <span>{s.active} aktif</span>
                  </div>
                </div>
                <div style={{ height: "8px", backgroundColor: "var(--bg-color)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: "99px", backgroundColor: pct > 66 ? "#10B981" : pct > 33 ? "#F59E0B" : "#94A3B8", transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Detail */}
      <div className="table-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(37,99,235,0.03)" }}>
              {["Staf", "Departemen", "Tugas Selesai", "Tugas Aktif", "Total Tugas"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...stats].sort((a, b) => b.completedInPeriod - a.completedInPeriod).map((s, idx) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)" }}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <StaffAvatar staffId={s.id} size={28} />
                    <div>
                      <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "var(--text-main)" }}>{s.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{s.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.dept}</td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#10B981" }}>{s.completedInPeriod}</span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3B82F6" }}>{s.active}</span>
                </td>
                <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── HALAMAN UTAMA ──────────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, createTask, updateTaskStatus, updateTask, deleteTask } = useTask();
  const [activeTab, setActiveTab] = useState("board");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const taskToDelete = tasks.find(t => t.id === deletingTaskId);

  function handleFormSave(formData) {
    if (editingTask) {
      updateTask(editingTask.id, { ...formData, deadline: new Date(formData.deadline).toISOString() });
    } else {
      createTask(formData);
    }
    setShowForm(false);
    setEditingTask(null);
  }

  function handleEdit(task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleDeleteRequest(taskId) {
    setDeletingTaskId(taskId);
  }

  function handleDeleteConfirm() {
    deleteTask(deletingTaskId);
    setDeletingTaskId(null);
  }

  const tabs = [
    { key: "board", label: "Board Kanban", icon: <FaThLarge /> },
    { key: "list",  label: "Daftar & Filter", icon: <FaList /> },
    { key: "report",label: "Laporan Produktivitas", icon: <FaChartBar /> },
  ];

  // Hitung summary counts
  const active = tasks.filter(t => t.status !== "Selesai").length;
  const urgent = tasks.filter(t => t.priority === "Darurat" && t.status !== "Selesai").length;
  const done = tasks.filter(t => t.status === "Selesai").length;

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <FaTasks style={{ color: "var(--primary-color)", fontSize: "1.4rem" }} />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Manajemen Tugas Staf</h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Distribusi dan pantau seluruh pekerjaan operasional hotel secara real-time
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", fontSize: "0.88rem" }}
        >
          <FaPlus /> Buat Tugas Baru
        </button>
      </div>

      {/* KPI Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Tugas", value: tasks.length, color: "var(--primary-color)", icon: <FaTasks /> },
          { label: "Tugas Aktif", value: active, color: "#F59E0B", icon: <FaClock /> },
          { label: "Darurat", value: urgent, color: "#EF4444", icon: <FaExclamationTriangle /> },
          { label: "Selesai", value: done, color: "#10B981", icon: <FaCheck /> },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ borderTop: `3px solid ${kpi.color}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "1.3rem", color: kpi.color, opacity: 0.8 }}>{kpi.icon}</div>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px" }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid var(--border-color)", marginBottom: "24px" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 18px", cursor: "pointer", fontSize: "0.85rem", fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? "var(--primary-color)" : "var(--text-muted)",
              border: "none", borderBottom: activeTab === tab.key ? "2px solid var(--primary-color)" : "2px solid transparent",
              backgroundColor: "transparent", marginBottom: "-2px", fontFamily: "inherit",
              transition: "all 0.15s",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "board" && (
        <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} onEdit={handleEdit} onDelete={handleDeleteRequest} />
      )}
      {activeTab === "list" && (
        <TaskListView tasks={tasks} onStatusChange={updateTaskStatus} onEdit={handleEdit} onDelete={handleDeleteRequest} />
      )}
      {activeTab === "report" && <ProductivityReport />}

      {/* Modals */}
      {showForm && (
        <TaskFormModal
          initialData={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onSave={handleFormSave}
        />
      )}
      {deletingTaskId && (
        <ConfirmDeleteModal
          task={taskToDelete}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingTaskId(null)}
        />
      )}
    </div>
  );
}
