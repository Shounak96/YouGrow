export function makeThumbnailSvg(opts: { headline: string; sub?: string }) {
  const W = 1280;
  const H = 720;

  const headline = (opts.headline || "").trim();
  const sub = (opts.sub || "").trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="40" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- glow blob -->
  <ellipse cx="980" cy="160" rx="360" ry="220" fill="rgba(99,102,241,0.18)" filter="url(#glow)"/>

  <!-- left accent -->
  <rect x="80" y="120" width="16" height="480" fill="rgba(255,255,255,0.10)"/>

  <!-- TEXT AREA (real wrapping using HTML/CSS) -->
  <foreignObject x="120" y="130" width="1040" height="520">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="
        height: 520px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 18px;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        color: white;
      "
    >
      <div
        style="
          font-size: 92px;
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: 1px;
          text-transform: uppercase;
          word-break: break-word;
          overflow-wrap: anywhere;
          text-shadow: 0 10px 30px rgba(0,0,0,0.45);
        "
      >
        ${escapeHtml(headline)}
      </div>

      <div
        style="
          margin-top: auto;
          font-size: 44px;
          font-weight: 800;
          line-height: 1.15;
          color: rgba(255,255,255,0.78);
          word-break: break-word;
          overflow-wrap: anywhere;
        "
      >
        ${escapeHtml(sub)}
      </div>
    </div>
  </foreignObject>
</svg>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
