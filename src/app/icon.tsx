import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: "18px",
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
