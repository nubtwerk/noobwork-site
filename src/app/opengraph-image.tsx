import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Noobwork - Joachim Haraldsen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2C3930",
          position: "relative",
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(63,79,68,0.4) 0%, rgba(44,57,48,0.8) 100%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ECD8BF",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            NOOBWORK.
          </div>

          {/* Pillars */}
          <div
            style={{
              fontSize: 16,
              color: "#ECD8BF",
              opacity: 0.7,
              letterSpacing: "4px",
              marginTop: 24,
              fontWeight: 600,
            }}
          >
            TOKYO LIFESTYLE  •  PERSONAL DEVELOPMENT  •  GAMING HERITAGE
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 18,
              color: "#A27B5D",
              marginTop: 40,
              letterSpacing: "2px",
            }}
          >
            noobwork.no
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
