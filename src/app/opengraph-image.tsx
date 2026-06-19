import { ImageResponse } from "next/og";

export const alt = "THE CREATIVE ENGINE - builtby_sh";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(120% 120% at 100% 0%, rgba(42,250,223,0.28), rgba(0,0,0,0) 52%), linear-gradient(130deg, #050505 0%, #0a0f14 65%, #111827 100%)",
          color: "#F8FAFC",
          fontFamily: "Inter, sans-serif",
          padding: "72px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "30px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "30px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: 22, letterSpacing: 5, color: "#2AFADF" }}>THE CREATIVE ENGINE</div>
            <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.05 }}>builtby_sh</div>
            <div style={{ fontSize: 38, color: "#A1A1AA" }}>Design. Build. Elevate.</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 26,
              color: "#A1A1AA",
              width: "100%",
            }}
          >
            <span>Graphic Designer</span>
            <span style={{ color: "#2AFADF" }}>x</span>
            <span>Frontend Developer</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
