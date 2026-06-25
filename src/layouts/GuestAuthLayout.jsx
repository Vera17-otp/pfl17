import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGuestAuth } from "../context/GuestAuthContext";

// Dekoratif SVG pattern untuk sisi kiri
function HotelPattern() {
  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.06,
      }}
    >
      <defs>
        <pattern
          id="gp-diamond"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="20,2 38,20 20,38 2,20"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#gp-diamond)" />
    </svg>
  );
}

export default function GuestAuthLayout() {
  const { isLoggedIn } = useGuestAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/guest/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#FDF8F2",
      }}
    >
      {/* Sisi kiri - Branding Hotel */}
      <div className="gp-left-panel">
        <HotelPattern />

        {/* Garis emas bagian atas */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #C9A84C, #F0D9A0, #C9A84C)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #C9A84C, #E8C87A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px rgba(201,168,76,0.4)",
            }}
          >
            <span style={{ fontSize: "2.2rem" }}>🏨</span>
          </div>

          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            HotelQu
          </h1>

          <p
            style={{
              fontSize: "0.95rem",
              color: "#C9A84C",
              fontWeight: 500,
              margin: "0 0 48px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Guest Portal
          </p>

          {/* Divider */}
          <div
            style={{
              width: "60px",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #C9A84C, transparent)",
              margin: "0 auto 40px",
            }}
          />

          <p
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1.4,
              maxWidth: "320px",
              margin: "0 auto 16px",
            }}
          >
            "Pengalaman Menginap Terbaik untuk Anda"
          </p>

          <p
            style={{
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            Kelola reservasi, nikmati layanan eksklusif, dan raih poin
            loyalitas hanya dengan satu akun.
          </p>

          {/* Fitur */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginTop: "48px",
              alignItems: "flex-start",
              maxWidth: "280px",
            }}
          >
            {[
              {
                icon: "📋",
                text: "Reservasi & Check-in Online",
              },
              {
                icon: "🛎️",
                text: "Room Service 24 Jam",
              },
              {
                icon: "⭐",
                text: "Program Loyalitas Eksklusif",
              },
            ].map((feat) => (
              <div
                key={feat.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  {feat.icon}
                </div>

                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                  }}
                >
                  {feat.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Efek gradient bagian bawah */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "120px",
            background:
              "linear-gradient(to top, rgba(10,22,40,0.6), transparent)",
          }}
        />
      </div>

      {/* Sisi kanan - Form login/register */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          overflowY: "auto",
          backgroundColor: "#FDF8F2",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {/* Logo khusus mobile */}
          <div className="gp-mobile-logo">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #1E3A5F, #2E5490)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏨</span>
              </div>

              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#1E3A5F",
                }}
              >
                HotelQu
              </span>
            </div>
          </div>

          <Outlet />
        </div>
      </div>

      <style>
        {`
          .gp-left-panel {
            display: none;
          }

          .gp-mobile-logo {
            text-align: center;
            margin-bottom: 32px;
          }

          @media (min-width: 1024px) {
            .gp-left-panel {
              display: flex;
              flex: 0 0 45%;
              background: linear-gradient(
                145deg,
                #1E3A5F 0%,
                #0F2240 60%,
                #0A1628 100%
              );
              position: relative;
              overflow: hidden;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 48px;
            }

            .gp-mobile-logo {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}