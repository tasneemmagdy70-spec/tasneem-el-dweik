import { ImageResponse } from "next/og";

// Home-screen icon (iOS): the same serif T as the tab icon, as a PNG.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1430" }}>
        <svg width="132" height="132" viewBox="0 0 64 64">
          <path
            fill="#8fa8ff"
            d="M14 13h36v11h-3.2c-.9-4.1-2.9-6-6.6-6H36.5v29.6c0 2.6 1.1 3.6 4.4 3.9V54H23.1v-2.5c3.3-.3 4.4-1.3 4.4-3.9V18h-3.7c-3.7 0-5.7 1.9-6.6 6H14z"
          />
          <circle cx="51" cy="47" r="3.4" fill="#d4b48c" />
        </svg>
      </div>
    ),
    size,
  );
}
