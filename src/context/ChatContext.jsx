import { createContext, useContext, useState, useCallback, useEffect } from "react";

// ── Daftar staf hotel (simulasi) ──────────────────────────────────────────────
export const STAFF_LIST = [
  { id: "mgr-01",  name: "Vera Zakia",      role: "General Manager",  dept: "Manajemen",    avatar: "VZ" },
  { id: "fo-01",   name: "Ahmad Fauzi",     role: "Front Office",     dept: "Front Office", avatar: "AF" },
  { id: "fo-02",   name: "Sari Dewi",       role: "Resepsionis",      dept: "Front Office", avatar: "SD" },
  { id: "hk-01",   name: "Bambang Susilo",  role: "Housekeeping Sup", dept: "Housekeeping", avatar: "BS" },
  { id: "hk-02",   name: "Wulan Sari",      role: "Room Attendant",   dept: "Housekeeping", avatar: "WS" },
  { id: "mt-01",   name: "Rudi Hartono",    role: "Teknisi",          dept: "Maintenance",  avatar: "RH" },
  { id: "fb-01",   name: "Lina Marlina",    role: "F&B Supervisor",   dept: "F&B",          avatar: "LM" },
  { id: "fb-02",   name: "Dedi Kurniawan",  role: "Waiter",           dept: "F&B",          avatar: "DK" },
];

// Departemen grup ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  "Front Office",
  "Housekeeping",
  "Maintenance",
  "F&B",
  "Manajemen",
];

// Identitas staf yang sedang login (simulasi = Vera Zakia / GM)
export const CURRENT_USER = STAFF_LIST[0];

// ── Helper ────────────────────────────────────────────────────────────────────
const LS_KEY = "hotelqu_chat_v1";
const LS_STATUS_KEY = "hotelqu_chat_status_v1";

function now() {
  return new Date().toISOString();
}

function formatTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function todayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    return formatTime(iso);
  }
  return `${d.getDate()}/${d.getMonth() + 1} ${formatTime(iso)}`;
}

// ── Pesan awal untuk demo ─────────────────────────────────────────────────────
const SEED_MESSAGES = [
  {
    id: "m-seed-1",
    threadId: "fo-01",        // DM ke Ahmad Fauzi
    senderId: CURRENT_USER.id,
    senderName: CURRENT_USER.name,
    senderAvatar: CURRENT_USER.avatar,
    text: "Ahmad, tolong konfirmasi check-in tamu VIP di kamar 501 pagi ini.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: true,
    type: "dm",
    attachment: null,
  },
  {
    id: "m-seed-2",
    threadId: "fo-01",
    senderId: "fo-01",
    senderName: "Ahmad Fauzi",
    senderAvatar: "AF",
    text: "Siap Bu, sudah saya konfirmasi. Tamu sudah check-in pukul 09.15.",
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    read: true,
    type: "dm",
    attachment: null,
  },
  {
    id: "m-seed-3",
    threadId: "hk-01",       // DM ke Bambang (HK)
    senderId: "hk-01",
    senderName: "Bambang Susilo",
    senderAvatar: "BS",
    text: "Bu Vera, kamar 305 sudah bersih dan siap ditempati.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read: false,
    type: "dm",
    attachment: { label: "Kamar 305", refType: "room" },
  },
  {
    id: "m-seed-4",
    threadId: "dept-Housekeeping",   // Grup Housekeeping
    senderId: CURRENT_USER.id,
    senderName: CURRENT_USER.name,
    senderAvatar: CURRENT_USER.avatar,
    text: "Tim Housekeeping, mohon prioritaskan pembersihan lantai 3 sebelum pukul 14.00. Terima kasih.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: true,
    type: "group",
    attachment: null,
  },
  {
    id: "m-seed-5",
    threadId: "dept-Housekeeping",
    senderId: "hk-02",
    senderName: "Wulan Sari",
    senderAvatar: "WS",
    text: "Baik Bu, kami segera mengerjakan.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    type: "group",
    attachment: null,
  },
  // Notifikasi sistem otomatis
  {
    id: "m-sys-1",
    threadId: "system",
    senderId: "system",
    senderName: "Sistem HotelQu",
    senderAvatar: "SYS",
    text: "🛎️ Tamu baru check-in di kamar 305 — John Doe (VIP).",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read: false,
    type: "system",
    attachment: { label: "BOK-5001", refType: "booking" },
  },
  {
    id: "m-sys-2",
    threadId: "system",
    senderId: "system",
    senderName: "Sistem HotelQu",
    senderAvatar: "SYS",
    text: "🧹 Kamar 201 membutuhkan pembersihan segera — sudah checkout.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    type: "system",
    attachment: null,
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // Muat pesan dari localStorage, atau gunakan seed
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return SEED_MESSAGES;
  });

  // Status kehadiran staf
  const [statusMap, setStatusMap] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_STATUS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    // Default: semua staf Online kecuali 2 yang offline/sibuk
    return {
      "mgr-01": "Online",
      "fo-01":  "Online",
      "fo-02":  "Sibuk",
      "hk-01":  "Online",
      "hk-02":  "Offline",
      "mt-01":  "Offline",
      "fb-01":  "Online",
      "fb-02":  "Sibuk",
    };
  });

  // Thread aktif yang sedang dibuka di panel
  const [activeThreadId, setActiveThreadId] = useState(null);

  // Visibilitas panel
  const [panelOpen, setPanelOpen] = useState(false);

  // Simpan ke localStorage setiap kali messages berubah
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LS_STATUS_KEY, JSON.stringify(statusMap));
  }, [statusMap]);

  // ── Hitung unread per thread ───────────────────────────────────────────────
  const unreadByThread = {};
  for (const msg of messages) {
    if (!msg.read && msg.senderId !== CURRENT_USER.id) {
      unreadByThread[msg.threadId] = (unreadByThread[msg.threadId] || 0) + 1;
    }
  }
  const totalUnread = Object.values(unreadByThread).reduce((a, b) => a + b, 0);

  // ── Kirim pesan ───────────────────────────────────────────────────────────
  const sendMessage = useCallback((threadId, text, attachment = null) => {
    const type = threadId.startsWith("dept-") ? "group" : threadId === "broadcast" ? "broadcast" : "dm";
    const newMsg = {
      id: `m-${Date.now()}`,
      threadId,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      text,
      timestamp: now(),
      read: true,
      type,
      attachment,
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulasi balasan otomatis setelah 2–4 detik (hanya untuk DM non-sistem)
    if (type === "dm") {
      const staff = STAFF_LIST.find(s => s.id === threadId);
      if (staff) {
        const delay = 2000 + Math.random() * 2000;
        const replies = [
          "Baik, siap!",
          "Sudah saya catat, terima kasih.",
          "Oke, akan segera dikerjakan.",
          "Siap Bu, kami akan segera tindak lanjuti.",
          "Terima kasih atas informasinya.",
        ];
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `m-${Date.now()}-reply`,
              threadId,
              senderId: staff.id,
              senderName: staff.name,
              senderAvatar: staff.avatar,
              text: replies[Math.floor(Math.random() * replies.length)],
              timestamp: now(),
              read: false,
              type: "dm",
              attachment: null,
            }
          ]);
        }, delay);
      }
    }
  }, []);

  // ── Broadcast ke semua staf ───────────────────────────────────────────────
  const sendBroadcast = useCallback((text) => {
    const newMsg = {
      id: `m-bc-${Date.now()}`,
      threadId: "broadcast",
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatar,
      text: `📢 PENGUMUMAN: ${text}`,
      timestamp: now(),
      read: true,
      type: "broadcast",
      attachment: null,
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  // ── Tambah notifikasi sistem ──────────────────────────────────────────────
  const addSystemNotif = useCallback((text, attachment = null) => {
    const newMsg = {
      id: `m-sys-${Date.now()}`,
      threadId: "system",
      senderId: "system",
      senderName: "Sistem HotelQu",
      senderAvatar: "SYS",
      text,
      timestamp: now(),
      read: false,
      type: "system",
      attachment,
    };
    setMessages(prev => [...prev, newMsg]);
  }, []);

  // ── Tandai semua pesan di thread sebagai terbaca ──────────────────────────
  const markThreadRead = useCallback((threadId) => {
    setMessages(prev =>
      prev.map(m => m.threadId === threadId ? { ...m, read: true } : m)
    );
  }, []);

  // ── Ubah status kehadiran diri sendiri ────────────────────────────────────
  const setMyStatus = useCallback((status) => {
    setStatusMap(prev => ({ ...prev, [CURRENT_USER.id]: status }));
  }, []);

  // ── Ambil pesan berdasarkan threadId ─────────────────────────────────────
  const getThreadMessages = useCallback((threadId) => {
    return messages.filter(m => m.threadId === threadId);
  }, [messages]);

  // ── Buka panel & langsung ke thread tertentu ──────────────────────────────
  const openThread = useCallback((threadId) => {
    setActiveThreadId(threadId);
    setPanelOpen(true);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      statusMap,
      activeThreadId,
      setActiveThreadId,
      panelOpen,
      setPanelOpen,
      unreadByThread,
      totalUnread,
      sendMessage,
      sendBroadcast,
      addSystemNotif,
      markThreadRead,
      setMyStatus,
      getThreadMessages,
      openThread,
      todayLabel,
      formatTime,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
