import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaStar, FaCheckCircle, FaGift } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const SURVEY_CATEGORIES = [
  { id: "cleanliness", label: "Kebersihan Kamar" },
  { id: "staff", label: "Pelayanan Staf" },
  { id: "facilities", label: "Fasilitas Hotel" },
  { id: "value", label: "Nilai Harga" },
  { id: "overall", label: "Keseluruhan" }
];

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          onClick={() => onChange(star)}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            color: star <= value ? GOLD : "#E2E8F0",
            transition: "color 0.2s"
          }}
        />
      ))}
    </div>
  );
}

export default function GuestSurvey() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [ratings, setRatings] = useState({ cleanliness: 0, staff: 0, facilities: 0, value: 0, overall: 0 });
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(null); // true = yes, false = no
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingChange = (category, val) => {
    setRatings(prev => ({ ...prev, [category]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isComplete = Object.values(ratings).every(v => v > 0) && recommend !== null;
    
    if (!isComplete) {
      alert("Mohon lengkapi semua penilaian bintang dan rekomendasi.");
      return;
    }
    
    // Simulate submission
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center", backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 10px 25px rgba(30,58,95,0.05)" }}>
        <FaCheckCircle style={{ fontSize: "4rem", color: "#10B981", margin: "0 auto 24px" }} />
        <h1 style={{ color: NAVY, fontSize: "1.5rem", fontWeight: 900, marginBottom: "12px" }}>Terima Kasih atas Ulasan Anda!</h1>
        <p style={{ color: "#6B7280", fontSize: "0.95rem", marginBottom: "32px", lineHeight: 1.5 }}>
          Ulasan Anda sangat berarti bagi kami untuk terus meningkatkan pelayanan di masa mendatang.
        </p>
        
        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", backgroundColor: "#FEF3C7", padding: "16px 24px", borderRadius: "16px", marginBottom: "32px" }}>
          <FaGift style={{ fontSize: "1.8rem", color: "#D97706" }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: "0 0 2px", fontSize: "0.8rem", color: "#B45309", fontWeight: 700, textTransform: "uppercase" }}>Selamat!</p>
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#92400E" }}>+50 Poin Bonus</p>
          </div>
        </div>

        <button onClick={() => navigate("/guest/loyalitas")} style={{ width: "100%", padding: "14px", backgroundColor: NAVY, color: "#fff", borderRadius: "12px", border: "none", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
          Lihat Poin Saya
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Survei Kepuasan</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Bagaimana pengalaman Anda menginap di {bookingId || "HotelQu"}?</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "32px", boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            {SURVEY_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: NAVY }}>{cat.label}</span>
                <StarRating value={ratings[cat.id]} onChange={(val) => handleRatingChange(cat.id, val)} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>
              Apakah Anda akan merekomendasikan hotel ini kepada teman/keluarga?
            </label>
            <div style={{ display: "flex", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", border: `2px solid ${recommend === true ? GOLD : BORDER}`, borderRadius: "12px", backgroundColor: recommend === true ? "#FEF3C7" : "#fff", cursor: "pointer", fontWeight: 700, color: NAVY, transition: "all 0.2s" }}>
                <input type="radio" name="recommend" checked={recommend === true} onChange={() => setRecommend(true)} style={{ display: "none" }} />
                Ya, Pasti!
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", border: `2px solid ${recommend === false ? NAVY : BORDER}`, borderRadius: "12px", backgroundColor: recommend === false ? "#EBF0F8" : "#fff", cursor: "pointer", fontWeight: 700, color: NAVY, transition: "all 0.2s" }}>
                <input type="radio" name="recommend" checked={recommend === false} onChange={() => setRecommend(false)} style={{ display: "none" }} />
                Tidak
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>
              Ada saran atau komentar tambahan? (Opsional)
            </label>
            <textarea 
              rows="4" 
              placeholder="Ceritakan pengalaman Anda secara singkat..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              style={{ width: "100%", padding: "16px", borderRadius: "12px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.95rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", color: NAVY }} 
            />
          </div>

          <button type="submit" style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
            Kirim Ulasan & Dapatkan +50 Poin
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 768px) {
          form > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
