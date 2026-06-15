import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaImage, FaCircle, FaUserCircle } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const INITIAL_CHAT = [
  { id: 1, sender: "staff", text: "Halo! Selamat datang di HotelQu. Ada yang bisa kami bantu?", time: "14:00" },
];

export default function GuestChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "guest",
      text: input,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInput("");
    setIsTyping(true);

    // Mock auto-reply from staff
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: "staff",
        text: "Baik, pesan Anda sudah kami terima. Segera kami tindak lanjuti.",
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newMsg = {
      id: Date.now(),
      sender: "guest",
      text: "📷 Mengirim foto...",
      image: URL.createObjectURL(file), // Mock image preview
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: "staff",
        text: "Terima kasih untuk lampirannya, akan segera kami cek.",
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 2500);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(30,58,95,0.05)" }}>
      
      {/* Header */}
      <div style={{ padding: "16px 20px", backgroundColor: NAVY, color: "#fff", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
            <FaUserCircle />
          </div>
          <div>
            <h2 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>Resepsionis HotelQu</h2>
            <p style={{ margin: 0, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.8)" }}>
              <FaCircle style={{ color: "#10B981", fontSize: "8px" }} /> Online • Membalas dalam 1 menit
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#F8FAFC", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map(msg => {
          const isGuest = msg.sender === "guest";
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isGuest ? "flex-end" : "flex-start" }}>
              <div style={{ 
                maxWidth: "75%", padding: "12px 16px", 
                backgroundColor: isGuest ? GOLD : "#fff", 
                color: isGuest ? NAVY : NAVY, 
                borderRadius: "16px", borderBottomRightRadius: isGuest ? "4px" : "16px", borderBottomLeftRadius: isGuest ? "16px" : "4px",
                border: isGuest ? "none" : `1px solid ${BORDER}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
                {msg.image && <img src={msg.image} alt="Upload" style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }} />}
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4, fontWeight: isGuest ? 600 : 500 }}>{msg.text}</p>
              </div>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: "4px", padding: "0 4px" }}>{msg.time}</span>
            </div>
          );
        })}
        {isTyping && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ padding: "12px 16px", backgroundColor: "#fff", borderRadius: "16px", borderBottomLeftRadius: "4px", border: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: "0.8rem", color: "#94A3B8", fontStyle: "italic" }}>Mengetik...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ padding: "16px", backgroundColor: "#fff", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "12px" }}>
        <input type="file" id="chatPhoto" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        <label htmlFor="chatPhoto" style={{ color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
          <FaImage />
        </label>
        
        <input 
          type="text" 
          placeholder="Ketik pesan..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "none", backgroundColor: "#F1F5F9", outline: "none", fontSize: "0.9rem", color: NAVY, fontFamily: "inherit" }} 
        />
        
        <button type="submit" disabled={!input.trim()} style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: input.trim() ? NAVY : "#CBD5E1", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          <FaPaperPlane style={{ marginLeft: "-2px" }} />
        </button>
      </form>
      
    </div>
  );
}
