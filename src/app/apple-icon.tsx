import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C3930",
          borderRadius: "36px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "90px",
          color: "#ECDBBF",
          letterSpacing: "-0.02em",
        }}
      >
        NW
      </div>
    ),
    { ...size },
  );
}
