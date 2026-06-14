import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { STAFF_LIST, DEPARTMENTS } from "./ChatContext";

export { STAFF_LIST, DEPARTMENTS };

// ── Konstanta ─────────────────────────────────────────────────────────────────
export const TASK_STATUSES = ["Belum Dimulai", "Sedang Dikerjakan", "Selesai"];

export const TASK_PRIORITIES = ["Rendah", "Sedang", "Tinggi", "Darurat"];

export const PRIORITY_CONFIG = {
  Rendah:  { color: "#64748B", bg: "rgba(100,116,139,0.12)", label: "Rendah" },
  Sedang:  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label: "Sedang" },
  Tinggi:  { color: "#F97316", bg: "rgba(249,115,22,0.12)",  label: "Tinggi" },
  Darurat: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "Darurat" },
};

export const STATUS_CONFIG = {
  "Belum Dimulai":    { color: "#64748B", bg: "rgba(100,116,139,0.10)" },
  "Sedang Dikerjakan":{ color: "#3B82F6", bg: "rgba(59,130,246,0.10)"  },
  "Selesai":          { color: "#10B981", bg: "rgba(16,185,129,0.10)"  },
};

// Peta kategori tiket helpdesk → dept tugas
export const HELPDESK_DEPT_MAP = {
  "Kebersihan":       "Housekeeping",
  "Fasilitas Rusak":  "Maintenance",
  "Layanan Kamar":    "F&B",
  "Kebisingan":       "Manajemen",
};

const LS_KEY = "hotelqu_tasks_v1";

// ── Helper ────────────────────────────────────────────────────────────────────
function uid() {
  return `TSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursLater(h, base) {
  const d = new Date(base || Date.now());
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_TASKS = [
  {
    id: "TSK-SEED-01",
    title: "Bersihkan Kamar 201",
    description: "Tamu sudah check-out. Siapkan kamar untuk tamu berikutnya.",
    dept: "Housekeeping",
    assigneeId: "hk-01",
    priority: "Tinggi",
    status: "Selesai",
    deadline: hoursLater(2, daysAgo(1)),
    roomRef: "201",
    createdAt: daysAgo(1),
    completedAt: daysAgo(0),
    source: "auto-checkout",
  },
  {
    id: "TSK-SEED-02",
    title: "Perbaiki AC Kamar 305",
    description: "AC di kamar 305 tidak berfungsi normal, perlu pengecekan dan perbaikan segera.",
    dept: "Maintenance",
    assigneeId: "mt-01",
    priority: "Darurat",
    status: "Sedang Dikerjakan",
    deadline: hoursLater(1),
    roomRef: "305",
    createdAt: daysAgo(0),
    completedAt: null,
    source: "auto-helpdesk",
  },
  {
    id: "TSK-SEED-03",
    title: "Persiapkan Sarapan VIP Suite 501",
    description: "Tamu VIP John Doe meminta sarapan khusus di kamar pukul 07.00.",
    dept: "F&B",
    assigneeId: "fb-01",
    priority: "Tinggi",
    status: "Belum Dimulai",
    deadline: hoursLater(8),
    roomRef: "501",
    createdAt: nowISO(),
    completedAt: null,
    source: "manual",
  },
  {
    id: "TSK-SEED-04",
    title: "Check-in Tamu Grup (15 orang)",
    description: "Proses check-in rombongan dari Jakarta, pastikan semua kamar sudah siap.",
    dept: "Front Office",
    assigneeId: "fo-01",
    priority: "Tinggi",
    status: "Sedang Dikerjakan",
    deadline: hoursLater(3),
    roomRef: null,
    createdAt: nowISO(),
    completedAt: null,
    source: "manual",
  },
  {
    id: "TSK-SEED-05",
    title: "Cuci Linen Kamar Lantai 2",
    description: "Kumpulkan dan cuci semua linen dari kamar lantai 2.",
    dept: "Housekeeping",
    assigneeId: "hk-02",
    priority: "Sedang",
    status: "Belum Dimulai",
    deadline: hoursLater(5),
    roomRef: null,
    createdAt: nowISO(),
    completedAt: null,
    source: "manual",
  },
  {
    id: "TSK-SEED-06",
    title: "Inspeksi Sistem Listrik Lantai 3",
    description: "Laporan ada fluktuasi listrik di beberapa kamar lantai 3.",
    dept: "Maintenance",
    assigneeId: "mt-01",
    priority: "Sedang",
    status: "Belum Dimulai",
    deadline: hoursLater(6),
    roomRef: null,
    createdAt: nowISO(),
    completedAt: null,
    source: "manual",
  },
  {
    id: "TSK-SEED-07",
    title: "Siapkan Laporan Pendapatan Mingguan",
    description: "Kumpulkan data pendapatan 7 hari terakhir untuk rapat manajemen.",
    dept: "Manajemen",
    assigneeId: "mgr-01",
    priority: "Rendah",
    status: "Selesai",
    deadline: hoursLater(24, daysAgo(2)),
    roomRef: null,
    createdAt: daysAgo(3),
    completedAt: daysAgo(2),
    source: "manual",
  },
  {
    id: "TSK-SEED-08",
    title: "Restock Mini Bar Kamar 102, 103, 104",
    description: "Isi ulang minuman dan makanan ringan mini bar di kamar yang diminta.",
    dept: "F&B",
    assigneeId: "fb-02",
    priority: "Rendah",
    status: "Selesai",
    deadline: hoursLater(3, daysAgo(1)),
    roomRef: "102",
    createdAt: daysAgo(1),
    completedAt: daysAgo(1),
    source: "manual",
  },
  {
    id: "TSK-SEED-09",
    title: "Konfirmasi Reservasi Telepon",
    description: "Hubungi 5 tamu yang belum konfirmasi reservasi minggu depan.",
    dept: "Front Office",
    assigneeId: "fo-02",
    priority: "Sedang",
    status: "Selesai",
    deadline: hoursLater(4, daysAgo(0)),
    roomRef: null,
    createdAt: daysAgo(0),
    completedAt: daysAgo(0),
    source: "manual",
  },
  {
    id: "TSK-SEED-10",
    title: "Tangani Keluhan Kebisingan Kamar 403",
    description: "Tamu di kamar 403 melaporkan kebisingan dari lantai atas. Investigasi dan tindak lanjuti.",
    dept: "Manajemen",
    assigneeId: "mgr-01",
    priority: "Tinggi",
    status: "Sedang Dikerjakan",
    deadline: hoursLater(1),
    roomRef: "403",
    createdAt: nowISO(),
    completedAt: null,
    source: "auto-helpdesk",
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
const TaskContext = createContext(null);

export function TaskProvider({ children, addSystemNotif }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return SEED_TASKS;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ── Buat tugas baru ────────────────────────────────────────────────────────
  const createTask = useCallback((data) => {
    const task = {
      id: uid(),
      title: data.title,
      description: data.description || "",
      dept: data.dept,
      assigneeId: data.assigneeId || null,
      priority: data.priority || "Sedang",
      status: "Belum Dimulai",
      deadline: data.deadline || hoursLater(8),
      roomRef: data.roomRef || null,
      createdAt: nowISO(),
      completedAt: null,
      source: data.source || "manual",
    };
    setTasks(prev => [task, ...prev]);

    // Kirim notifikasi ke Chat Sistem
    if (addSystemNotif) {
      const assignee = STAFF_LIST.find(s => s.id === task.assigneeId);
      const assigneeName = assignee ? assignee.name : "Staf";
      addSystemNotif(
        `📋 Tugas baru: "${task.title}" ditetapkan untuk ${assigneeName} [${task.priority}]`,
        task.roomRef ? { label: `Kamar ${task.roomRef}`, refType: "room" } : null
      );
    }

    return task;
  }, [addSystemNotif]);

  // ── Update status tugas ────────────────────────────────────────────────────
  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            completedAt: newStatus === "Selesai" ? nowISO() : t.completedAt,
          }
        : t
    ));
  }, []);

  // ── Update tugas (full edit) ───────────────────────────────────────────────
  const updateTask = useCallback((taskId, data) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t));
  }, []);

  // ── Hapus tugas ────────────────────────────────────────────────────────────
  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // ── Auto: checkout → tugas kebersihan ─────────────────────────────────────
  const createCheckoutTask = useCallback((roomNumber, bookingId) => {
    // Tentukan HK staf yang paling sedikit tugasnya
    const hkStaff = STAFF_LIST.filter(s => s.dept === "Housekeeping");
    const taskCounts = hkStaff.map(s => ({
      id: s.id,
      count: tasks.filter(t => t.assigneeId === s.id && t.status !== "Selesai").length,
    }));
    taskCounts.sort((a, b) => a.count - b.count);
    const assigneeId = taskCounts[0]?.id || hkStaff[0]?.id || null;

    return createTask({
      title: `Bersihkan Kamar ${roomNumber}`,
      description: `Tamu sudah check-out dari kamar ${roomNumber}${bookingId ? ` (${bookingId})` : ""}. Bersihkan dan siapkan untuk tamu berikutnya.`,
      dept: "Housekeeping",
      assigneeId,
      priority: "Sedang",
      deadline: hoursLater(2),
      roomRef: roomNumber,
      source: "auto-checkout",
    });
  }, [createTask, tasks]);

  // ── Auto: tiket helpdesk → tugas penanganan ────────────────────────────────
  const createHelpdeskTask = useCallback((ticket) => {
    const dept = HELPDESK_DEPT_MAP[ticket.category] || "Manajemen";
    const deptStaff = STAFF_LIST.filter(s => s.dept === dept);
    const taskCounts = deptStaff.map(s => ({
      id: s.id,
      count: tasks.filter(t => t.assigneeId === s.id && t.status !== "Selesai").length,
    }));
    taskCounts.sort((a, b) => a.count - b.count);
    const assigneeId = taskCounts[0]?.id || deptStaff[0]?.id || null;

    const priorityMap = { Darurat: "Darurat", Tinggi: "Tinggi", Sedang: "Sedang", Rendah: "Rendah" };

    return createTask({
      title: `Tangani Keluhan: ${ticket.category} — Kamar ${ticket.roomNumber}`,
      description: ticket.description || ticket.issue || "Keluhan dari tamu, segera ditindaklanjuti.",
      dept,
      assigneeId,
      priority: priorityMap[ticket.priority] || "Sedang",
      deadline: hoursLater(ticket.priority === "Darurat" ? 1 : ticket.priority === "Tinggi" ? 2 : 4),
      roomRef: ticket.roomNumber || null,
      source: "auto-helpdesk",
    });
  }, [createTask, tasks]);

  // ── Statistik produktivitas per staf ──────────────────────────────────────
  const getProductivityStats = useCallback((period = "week") => {
    const now = new Date();
    const cutoff = new Date();
    if (period === "today") {
      cutoff.setHours(0, 0, 0, 0);
    } else {
      cutoff.setDate(now.getDate() - 7);
    }

    return STAFF_LIST.map(staff => {
      const myTasks = tasks.filter(t => t.assigneeId === staff.id);
      const completedInPeriod = myTasks.filter(t =>
        t.status === "Selesai" &&
        t.completedAt &&
        new Date(t.completedAt) >= cutoff
      ).length;
      const active = myTasks.filter(t => t.status !== "Selesai").length;
      const total = myTasks.length;
      return { ...staff, completedInPeriod, active, total };
    });
  }, [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks,
      createTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      createCheckoutTask,
      createHelpdeskTask,
      getProductivityStats,
      TASK_STATUSES,
      TASK_PRIORITIES,
      PRIORITY_CONFIG,
      STATUS_CONFIG,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  return useContext(TaskContext);
}
