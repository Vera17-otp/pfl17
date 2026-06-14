import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaTimes, FaSearch, FaPaperPlane, FaBullhorn,
  FaCircle, FaUsers, FaRobot, FaChevronLeft,
  FaLink, FaFilter,
} from "react-icons/fa";
import {
  useChat,
  STAFF_LIST,
  DEPARTMENTS,
  CURRENT_USER,
} from "../context/ChatContext";

// ── Status presence config ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Online:  { color: "#10B981", label: "Online" },
  Sibuk:   { color: "#F59E0B", label: "Sibuk" },
  Offline: { color: "#94A3B8", label: "Offline" },
};

// ── Thread list sidebar ────────────────────────────────────────────────────────
function ThreadList({ onSelectThread, activeId }) {
  const { unreadByThread, statusMap, messages } = useChat();
  const [search, setSearch] = useState("");

  // Hitung preview pesan terakhir per thread
  function lastMsg(threadId) {
    const msgs = messages.filter(m => m.threadId === threadId);
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  }

  // DM threads: daftar staf kecuali diri sendiri
  const dmThreads = STAFF_LIST.filter(s => s.id !== CURRENT_USER.id);

  // Grup threads: satu per departemen
  const groupThreads = DEPARTMENTS.map(dept => ({
    id: `dept-${dept}`,
    name: dept,
    type: "group",
  }));

  const systemThread = { id: "system", name: "Notifikasi Sistem", type: "system" };
  const broadcastThread = { id: "broadcast", name: "Broadcast Pengumuman", type: "broadcast" };

  function matchSearch(name) {
    return name.toLowerCase().includes(search.toLowerCase());
  }

  const filteredDm = dmThreads.filter(s => matchSearch(s.name) || matchSearch(s.role));
  const filteredGroup = groupThreads.filter(g => matchSearch(g.name));

  function PreviewText({ threadId }) {
    const msg = lastMsg(threadId);
    if (!msg) return <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>Belum ada pesan</span>;
    const maxLen = 35;
    const text = msg.text.length > maxLen ? msg.text.slice(0, maxLen) + "…" : msg.text;
    return <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{text}</span>;
  }

  function ThreadRow({ id, label, sublabel, avatar, badgeCount, isActive, statusColor, onClick }) {
    return (
      <div
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          cursor: "pointer",
          borderRadius: "10px",
          backgroundColor: isActive ? "rgba(37, 99, 235, 0.08)" : "transparent",
          transition: "background-color 0.15s",
          marginBottom: "2px",
          position: "relative",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            backgroundColor: id === "system" ? "#7C3AED20" : id === "broadcast" ? "#F59E0B20" : id.startsWith("dept-") ? "#10B98120" : "rgba(37,99,235,0.12)",
            color: id === "system" ? "#7C3AED" : id === "broadcast" ? "#F59E0B" : id.startsWith("dept-") ? "#059669" : "var(--primary-color)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.78rem",
          }}>
            {avatar}
          </div>
          {statusColor && (
            <span style={{
              position: "absolute", bottom: "1px", right: "1px",
              width: "10px", height: "10px", borderRadius: "50%",
              backgroundColor: statusColor, border: "2px solid var(--surface-color)",
            }} />
          )}
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: badgeCount ? 700 : 500, fontSize: "0.82rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
              {label}
            </span>
            {badgeCount > 0 && (
              <span style={{
                minWidth: "18px", height: "18px", borderRadius: "9px",
                backgroundColor: "var(--danger-color)", color: "#fff",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", flexShrink: 0,
              }}>{badgeCount}</span>
            )}
          </div>
          {sublabel && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sublabel}</div>}
          <PreviewText threadId={id} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Search */}
      <div style={{ padding: "10px 14px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-color)", borderRadius: "8px", padding: "7px 10px" }}>
          <FaSearch style={{ color: "var(--text-muted)", fontSize: "0.75rem" }} />
          <input
            type="text"
            placeholder="Cari staf atau grup…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.8rem", flex: 1, color: "var(--text-main)" }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
        {/* Spesial threads */}
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", padding: "8px 6px 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sistem</div>
        <ThreadRow
          id="system" label="Notifikasi Sistem"
          sublabel="Alert otomatis"
          avatar={<FaRobot style={{ fontSize: "0.9rem" }} />}
          badgeCount={unreadByThread["system"] || 0}
          isActive={activeId === "system"}
          statusColor={null}
          onClick={() => onSelectThread("system")}
        />
        <ThreadRow
          id="broadcast" label="Broadcast Pengumuman"
          sublabel="Semua staf"
          avatar={<FaBullhorn style={{ fontSize: "0.9rem" }} />}
          badgeCount={unreadByThread["broadcast"] || 0}
          isActive={activeId === "broadcast"}
          statusColor={null}
          onClick={() => onSelectThread("broadcast")}
        />

        {/* Grup Departemen */}
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", padding: "12px 6px 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grup Departemen</div>
        {filteredGroup.map(g => (
          <ThreadRow
            key={g.id} id={g.id} label={g.name}
            sublabel="Grup"
            avatar={<FaUsers style={{ fontSize: "0.9rem" }} />}
            badgeCount={unreadByThread[g.id] || 0}
            isActive={activeId === g.id}
            statusColor={null}
            onClick={() => onSelectThread(g.id)}
          />
        ))}

        {/* DM staf */}
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", padding: "12px 6px 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pesan Langsung</div>
        {filteredDm.map(s => {
          const st = statusMap[s.id] || "Offline";
          return (
            <ThreadRow
              key={s.id} id={s.id} label={s.name}
              sublabel={s.role}
              avatar={s.avatar}
              badgeCount={unreadByThread[s.id] || 0}
              isActive={activeId === s.id}
              statusColor={STATUS_CONFIG[st]?.color}
              onClick={() => onSelectThread(s.id)}
            />
          );
        })}

        {filteredDm.length === 0 && filteredGroup.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, showAvatar }) {
  const isMe = msg.senderId === CURRENT_USER.id;
  const isSystem = msg.senderId === "system";

  if (isSystem) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
        <div style={{
          backgroundColor: "rgba(124, 58, 237, 0.08)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
          borderRadius: "10px",
          padding: "8px 14px",
          maxWidth: "85%",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.78rem", color: "#7C3AED", fontWeight: 600 }}>{msg.text}</div>
          {msg.attachment && (
            <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
              <FaLink style={{ fontSize: "0.6rem", color: "#7C3AED" }} />
              <span style={{ fontSize: "0.68rem", color: "#7C3AED", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
                {msg.attachment.label}
              </span>
            </div>
          )}
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: isMe ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: "8px",
      marginBottom: "6px",
    }}>
      {/* Avatar (hanya tampil sekali untuk blok pesan sama) */}
      {showAvatar && !isMe ? (
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
          backgroundColor: "rgba(37,99,235,0.12)", color: "var(--primary-color)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.65rem", fontWeight: 700,
        }}>
          {msg.senderAvatar}
        </div>
      ) : !isMe ? (
        <div style={{ width: "30px", flexShrink: 0 }} />
      ) : null}

      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "2px", alignItems: isMe ? "flex-end" : "flex-start" }}>
        {showAvatar && !isMe && (
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, paddingLeft: "2px" }}>{msg.senderName}</span>
        )}
        <div style={{
          backgroundColor: isMe ? "var(--primary-color)" : "var(--bg-color)",
          color: isMe ? "#fff" : "var(--text-main)",
          padding: "8px 12px",
          borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          fontSize: "0.82rem",
          lineHeight: "1.45",
          border: isMe ? "none" : "1px solid var(--border-color)",
          wordBreak: "break-word",
        }}>
          {msg.text}
          {msg.attachment && (
            <div style={{
              marginTop: "6px",
              padding: "5px 8px",
              backgroundColor: isMe ? "rgba(255,255,255,0.15)" : "rgba(37,99,235,0.08)",
              borderRadius: "6px",
              display: "flex", alignItems: "center", gap: "5px",
              cursor: "pointer",
            }}>
              <FaLink style={{ fontSize: "0.65rem", color: isMe ? "#fff" : "var(--primary-color)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isMe ? "#fff" : "var(--primary-color)", textDecoration: "underline" }}>
                {msg.attachment.label}
              </span>
            </div>
          )}
        </div>
        <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", paddingRight: isMe ? "2px" : 0, paddingLeft: isMe ? 0 : "2px" }}>
          {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ── Thread View ────────────────────────────────────────────────────────────────
function ThreadView({ threadId, onBack }) {
  const { getThreadMessages, sendMessage, sendBroadcast, markThreadRead, statusMap, messages } = useChat();
  const [inputText, setInputText] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const threadMsgs = getThreadMessages(threadId);
  const isBroadcast = threadId === "broadcast";
  const isSystem = threadId === "system";
  const isGroup = threadId.startsWith("dept-");

  // Info header thread
  const staff = STAFF_LIST.find(s => s.id === threadId);
  const deptName = isGroup ? threadId.replace("dept-", "") : null;
  const memberCount = isGroup ? STAFF_LIST.filter(s => s.dept === deptName).length : null;

  let headerTitle = "";
  let headerSub = "";
  if (isBroadcast) { headerTitle = "Broadcast Pengumuman"; headerSub = "Semua staf hotel"; }
  else if (isSystem) { headerTitle = "Notifikasi Sistem"; headerSub = "Alert otomatis dari HotelQu"; }
  else if (isGroup) { headerTitle = deptName; headerSub = `${memberCount} anggota`; }
  else if (staff) {
    headerTitle = staff.name;
    const st = statusMap[staff.id] || "Offline";
    headerSub = `${staff.role} • ${STATUS_CONFIG[st]?.label}`;
  }

  // Filter pesan
  const filteredMsgs = useMemo(() => {
    return threadMsgs.filter(m => {
      const matchText = searchQuery ? m.text.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchDate = filterDate ? m.timestamp.startsWith(filterDate) : true;
      return matchText && matchDate;
    });
  }, [threadMsgs, searchQuery, filterDate]);

  // Mark as read saat buka thread
  useEffect(() => {
    markThreadRead(threadId);
  }, [threadId, markThreadRead, messages.length]);

  // Auto-scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMsgs.length]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  function handleSend() {
    if (!inputText.trim()) return;
    if (isBroadcast) {
      sendBroadcast(inputText.trim());
    } else {
      sendMessage(threadId, inputText.trim());
    }
    setInputText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Kelompokkan pesan untuk tampilkan avatar sekali per pengirim-blok
  function withAvatarFlag(msgs) {
    return msgs.map((m, i) => ({
      ...m,
      showAvatar: i === 0 || msgs[i - 1].senderId !== m.senderId,
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header thread */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 14px", borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--surface-color)", flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "6px", display: "flex" }}>
          <FaChevronLeft />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)" }}>{headerTitle}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{headerSub}</div>
        </div>
        <button
          onClick={() => setSearchMode(!searchMode)}
          title="Cari pesan"
          style={{ background: searchMode ? "rgba(37,99,235,0.1)" : "none", border: "none", cursor: "pointer", color: searchMode ? "var(--primary-color)" : "var(--text-muted)", padding: "6px", borderRadius: "6px", display: "flex" }}
        >
          <FaSearch />
        </button>
      </div>

      {/* Search/Filter bar */}
      {searchMode && (
        <div style={{ display: "flex", gap: "8px", padding: "8px 14px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--surface-color)", borderRadius: "8px", padding: "6px 10px", border: "1px solid var(--border-color)" }}>
            <FaSearch style={{ color: "var(--text-muted)", fontSize: "0.7rem" }} />
            <input
              type="text"
              placeholder="Cari kata kunci…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.78rem", flex: 1, color: "var(--text-main)" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--surface-color)", borderRadius: "8px", padding: "6px 10px", border: "1px solid var(--border-color)" }}>
            <FaFilter style={{ color: "var(--text-muted)", fontSize: "0.7rem" }} />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.78rem", color: "var(--text-main)" }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column" }}>
        {filteredMsgs.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.82rem", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "2rem" }}>💬</span>
            {searchQuery || filterDate ? "Tidak ada pesan sesuai filter." : "Belum ada pesan. Mulai percakapan!"}
          </div>
        )}
        {withAvatarFlag(filteredMsgs).map(m => (
          <MessageBubble key={m.id} msg={m} showAvatar={m.showAvatar} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isSystem && (
        <div style={{
          padding: "10px 14px", borderTop: "1px solid var(--border-color)",
          backgroundColor: "var(--surface-color)", flexShrink: 0,
        }}>
          {isBroadcast && (
            <div style={{ marginBottom: "6px", padding: "5px 10px", backgroundColor: "rgba(245,158,11,0.08)", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span style={{ fontSize: "0.7rem", color: "#92400E", fontWeight: 600 }}>
                📢 Pesan ini akan dikirim sebagai pengumuman ke semua staf
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isBroadcast ? "Tulis pengumuman…" : isGroup ? `Pesan ke grup ${deptName}…` : `Pesan ke ${staff?.name || "staf"}…`}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                padding: "9px 13px",
                fontSize: "0.82rem",
                outline: "none",
                backgroundColor: "var(--bg-color)",
                color: "var(--text-main)",
                fontFamily: "inherit",
                maxHeight: "90px",
                overflowY: "auto",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              style={{
                width: "38px", height: "38px", borderRadius: "50%",
                backgroundColor: inputText.trim() ? "var(--primary-color)" : "var(--border-color)",
                border: "none", cursor: inputText.trim() ? "pointer" : "default",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background-color 0.2s",
              }}
            >
              <FaPaperPlane style={{ fontSize: "0.8rem" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status Selector ────────────────────────────────────────────────────────────
function StatusSelector() {
  const { statusMap, setMyStatus } = useChat();
  const myStatus = statusMap[CURRENT_USER.id] || "Online";
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "none", border: "1px solid var(--border-color)",
          borderRadius: "8px", padding: "5px 10px", cursor: "pointer",
          fontSize: "0.75rem", color: "var(--text-main)", fontFamily: "inherit",
        }}
      >
        <FaCircle style={{ color: STATUS_CONFIG[myStatus]?.color, fontSize: "0.55rem" }} />
        {STATUS_CONFIG[myStatus]?.label}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "110%", left: 0,
          backgroundColor: "var(--surface-color)", borderRadius: "10px",
          border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)",
          zIndex: 99, minWidth: "120px", overflow: "hidden",
        }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div
              key={key}
              onClick={() => { setMyStatus(key); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "9px 14px", cursor: "pointer", fontSize: "0.8rem",
                backgroundColor: myStatus === key ? "rgba(37,99,235,0.06)" : "transparent",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = myStatus === key ? "rgba(37,99,235,0.06)" : "transparent"}
            >
              <FaCircle style={{ color: cfg.color, fontSize: "0.55rem" }} />
              <span style={{ color: "var(--text-main)", fontWeight: myStatus === key ? 700 : 400 }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ChatPanel ─────────────────────────────────────────────────────────────
export default function ChatPanel() {
  const { panelOpen, setPanelOpen, activeThreadId, setActiveThreadId, markThreadRead } = useChat();

  function handleSelectThread(id) {
    setActiveThreadId(id);
    markThreadRead(id);
  }

  function handleBack() {
    setActiveThreadId(null);
  }

  if (!panelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setPanelOpen(false)}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          zIndex: 1999,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "380px",
          backgroundColor: "var(--surface-color)",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease",
        }}
      >
        {/* Panel Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--surface-color)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
              💬 Komunikasi Internal
            </span>
            <StatusSelector />
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: "1rem",
              display: "flex", padding: "6px", borderRadius: "8px",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeThreadId ? (
            <ThreadView threadId={activeThreadId} onBack={handleBack} />
          ) : (
            <ThreadList onSelectThread={handleSelectThread} activeId={activeThreadId} />
          )}
        </div>
      </div>
    </>
  );
}
