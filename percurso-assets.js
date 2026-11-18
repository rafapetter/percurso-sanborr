// Imagens sintéticas do percurso: desenho técnico gerado a partir das medidas, fotos simuladas e documentos.
// Nada aqui vem de material real de empresa. As cores dentro das fotos são conteúdo da imagem, não da interface.
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nf = (n) => String(n).replace(".", ",");
  let uid = 0;

  // Desenho de cilindro revestido: vista lateral com cotas e legenda.
  function roll(o) {
    const id = `h${++uid}`;
    const total = o.L + 2 * o.shaftL;
    const s = Math.min(560 / total, 150 / o.D);
    const w = total * s, x0 = (720 - w) / 2, cy = 150;
    const R = (o.D * s) / 2, r = (o.shaftD * s) / 2, rc = ((o.coreD || o.D - 20) * s) / 2;
    const xa = x0 + o.shaftL * s, xb = xa + o.L * s, xe = x0 + w;
    const ch = Math.min(6, R * 0.15);
    const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="thin" marker-start="url(#a${id})" marker-end="url(#a${id})"/>`;
    const lowY = cy + R + 36, topY = cy - R - 26;
    const hl = (o.highlight || []);
    const hlRect = (k, x, y, ww, hh) => (hl.includes(k) ? `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" rx="4" fill="var(--mark)" opacity="0.55"/>` : "");
    return `<svg class="dwg" viewBox="0 0 720 360" role="img" aria-label="${esc(o.aria || `Desenho do cilindro: Ø ${o.D} por ${o.L} mm de borracha, ${total} mm no total`)}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="0.7" opacity="0.45"/></pattern>
        <marker id="a${id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9z" fill="currentColor"/></marker>
      </defs>
      <rect x="1" y="1" width="718" height="358" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
      ${hlRect("L", xa - 4, topY - 18, xb - xa + 8, 26)}${hlRect("total", x0 - 4, lowY - 10, w + 8, 28)}${hlRect("D", xe + 6, cy - R - 4, 70, 2 * R + 8)}${hlRect("shaftD", x0 - 74, cy - r - 4, 68, 2 * r + 8)}
      <g fill="none" stroke="currentColor" stroke-width="1.6">
        <rect x="${x0}" y="${cy - r}" width="${xa - x0}" height="${2 * r}"/>
        <rect x="${xb}" y="${cy - r}" width="${xe - xb}" height="${2 * r}"/>
        <path d="M${xa} ${cy - R + ch} L${xa + ch} ${cy - R} L${xb - ch} ${cy - R} L${xb} ${cy - R + ch} L${xb} ${cy + R - ch} L${xb - ch} ${cy + R} L${xa + ch} ${cy + R} L${xa} ${cy + R - ch} Z" fill="url(#${id})"/>
        <line x1="${xa}" y1="${cy - rc}" x2="${xb}" y2="${cy - rc}" stroke-dasharray="6 4" class="thin"/>
        <line x1="${xa}" y1="${cy + rc}" x2="${xb}" y2="${cy + rc}" stroke-dasharray="6 4" class="thin"/>
        <line x1="${x0 - 14}" y1="${cy}" x2="${xe + 14}" y2="${cy}" stroke-dasharray="14 4 2 4" class="thin" opacity="0.7"/>
        <line x1="${xa}" y1="${topY - 6}" x2="${xa}" y2="${cy - R}" class="thin"/><line x1="${xb}" y1="${topY - 6}" x2="${xb}" y2="${cy - R}" class="thin"/>
        <line x1="${x0}" y1="${cy + r}" x2="${x0}" y2="${lowY + 6}" class="thin"/><line x1="${xe}" y1="${cy + r}" x2="${xe}" y2="${lowY + 6}" class="thin"/>
        ${arrow(xa, topY, xb, topY)}${arrow(x0, lowY, xe, lowY)}
        ${arrow(xe + 40, cy - R, xe + 40, cy + R)}<line x1="${xb}" y1="${cy - R}" x2="${xe + 48}" y2="${cy - R}" class="thin"/><line x1="${xb}" y1="${cy + R}" x2="${xe + 48}" y2="${cy + R}" class="thin"/>
        ${arrow(x0 - 40, cy - r, x0 - 40, cy + r)}<line x1="${x0 - 48}" y1="${cy - r}" x2="${x0}" y2="${cy - r}" class="thin"/><line x1="${x0 - 48}" y1="${cy + r}" x2="${x0}" y2="${cy + r}" class="thin"/>
      </g>
      <g fill="currentColor" font-family="Source Sans 3, system-ui, sans-serif" font-size="13" text-anchor="middle">
        <text x="${(xa + xb) / 2}" y="${topY - 6}">${nf(o.L)}${o.tolL ? ` ${esc(o.tolL)}` : ""}</text>
        <text x="${(x0 + xe) / 2}" y="${lowY + 18}">${nf(total)}</text>
        <text x="${xe + 56}" y="${cy + 4}" text-anchor="start">Ø ${nf(o.D)}${o.tolD ? ` ${esc(o.tolD)}` : ""}</text>
        <text x="${x0 - 56}" y="${cy + 4}" text-anchor="end">Ø ${nf(o.shaftD)}</text>
      </g>
      <g font-family="Source Sans 3, system-ui, sans-serif" fill="currentColor">
        <rect x="438" y="270" width="270" height="78" fill="none" stroke="currentColor" stroke-width="1"/>
        <line x1="438" y1="296" x2="708" y2="296" stroke="currentColor" stroke-width="0.8"/>
        <text x="448" y="288" font-size="13" font-weight="600">${esc(o.title)}</text>
        <text x="448" y="314" font-size="12">${esc(o.code)} · rev. ${esc(o.rev || "A")} · sem escala</text>
        <text x="448" y="332" font-size="12">${esc(o.material || "Borracha a definir")} · ${esc(o.hardness || "dureza a definir")}</text>
        <text x="448" y="344" font-size="10" opacity="0.75">${esc(o.foot || "Medidas em mm")}</text>
        ${(o.notes || []).map((n, i) => `<text x="14" y="${292 + i * 16}" font-size="11.5" opacity="0.85">${esc(n)}</text>`).join("")}
      </g>
      ${o.stamp ? `<g transform="translate(16 18)"><rect width="${o.stamp.length * 7.4 + 20}" height="24" rx="12" fill="var(--mark)"/><text x="10" y="16" font-size="12" font-weight="600" fill="var(--mark-soft-foreground)" font-family="Source Sans 3, system-ui, sans-serif">${esc(o.stamp)}</text></g>` : ""}
    </svg>`;
  }

  // Fotos simuladas, em perspectiva, de oficina de revestimento de cilindros.
  // Servem para mostrar o uso; medida e dureza nunca saem delas sem conferência.
  const tag = `<g><rect x="16" y="552" width="150" height="30" rx="15" fill="#000" opacity="0.55"/><text x="91" y="572" fill="#fff" font-size="14" text-anchor="middle" font-family="Source Sans 3, system-ui, sans-serif">Imagem sintética</text></g>`;
  const frame = (inner, label) => `<svg viewBox="0 0 800 600" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${inner}${tag}</svg>`;
  function defs(id) {
    return `<defs>
      <filter id="n${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${id}" result="t"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
      <filter id="c${id}"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="4" seed="${id + 3}"/><feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.41  0 0 0 0 0.39  0 0 0 0.9 0"/></filter>
      <filter id="b${id}"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="s${id}"><feGaussianBlur stdDeviation="14"/></filter>
      <linearGradient id="wall${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa29c"/><stop offset="1" stop-color="#6f7570"/></linearGradient>
      <linearGradient id="floor${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d7a73"/><stop offset="1" stop-color="#4c4a45"/></linearGradient>
      <linearGradient id="rub${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1c1b"/><stop offset="0.16" stop-color="#5d605d"/><stop offset="0.27" stop-color="#2c2e2c"/><stop offset="0.7" stop-color="#151615"/><stop offset="1" stop-color="#0a0b0a"/></linearGradient>
      <linearGradient id="stl${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7e858a"/><stop offset="0.22" stop-color="#eef1f3"/><stop offset="0.45" stop-color="#a9b0b5"/><stop offset="1" stop-color="#3f4448"/></linearGradient>
      <linearGradient id="face${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3c3a"/><stop offset="1" stop-color="#191a19"/></linearGradient>
      <radialGradient id="vig${id}" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient>
      <pattern id="gr${id}" width="800" height="3" patternUnits="userSpaceOnUse"><rect width="800" height="1" fill="#fff" opacity="0.05"/></pattern>
    </defs>`;
  }
  function shop(id, { bench = false } = {}) {
    return `<g filter="url(#b${id})"><rect width="800" height="330" fill="url(#wall${id})"/>
      <rect x="40" y="70" width="190" height="200" rx="4" fill="#4e6b5a" opacity="0.75"/><rect x="60" y="95" width="150" height="60" rx="3" fill="#2f3a34" opacity="0.6"/>
      <rect x="560" y="40" width="210" height="240" rx="6" fill="#3c4a52" opacity="0.7"/><circle cx="665" cy="160" r="54" fill="#59646b" opacity="0.7"/>
      <rect x="300" y="120" width="180" height="16" fill="#c9a13a" opacity="0.6"/><rect x="0" y="300" width="800" height="30" fill="#5c5f5b"/></g>
      <rect y="330" width="800" height="270" fill="url(#floor${id})"/><rect y="330" width="800" height="270" filter="url(#c${id})" opacity="0.5"/>
      ${bench ? `<rect x="40" y="350" width="720" height="34" fill="#7a5a3a"/><rect x="40" y="384" width="720" height="10" fill="#4a3522"/><rect x="40" y="350" width="720" height="34" filter="url(#n${id})" opacity="0.35"/>` : ""}`;
  }
  // Cilindro horizontal visto de leve de cima e da direita: corpo, face da ponta em elipse, eixo.
  function cyl(id, { x1, x2, cy, r, shaft = 0.34, shaftLen = 70, crack = false, worn = false, ground = false, floor = null }) {
    const e = r * 0.3, rs = r * shaft, es = e * shaft;
    const body = `M${x1} ${cy - r} L${x2} ${cy - r} A${e} ${r} 0 0 1 ${x2} ${cy + r} L${x1} ${cy + r} A${e} ${r} 0 0 1 ${x1} ${cy - r} Z`;
    const shaftL = `<path d="M${x1 - shaftLen} ${cy - rs} L${x1} ${cy - rs} L${x1} ${cy + rs} L${x1 - shaftLen} ${cy + rs} A${es} ${rs} 0 0 1 ${x1 - shaftLen} ${cy - rs} Z" fill="url(#stl${id})"/>`;
    const shaftR = `<path d="M${x2} ${cy - rs} L${x2 + shaftLen} ${cy - rs} A${es} ${rs} 0 0 1 ${x2 + shaftLen} ${cy + rs} L${x2} ${cy + rs} Z" fill="url(#stl${id})"/><ellipse cx="${x2 + shaftLen}" cy="${cy}" rx="${es}" ry="${rs}" fill="#9aa1a6"/><ellipse cx="${x2 + shaftLen}" cy="${cy}" rx="${es * 0.35}" ry="${rs * 0.35}" fill="#5a6166"/>`;
    return `<ellipse cx="${(x1 + x2) / 2}" cy="${floor ?? cy + r + 22}" rx="${(x2 - x1) / 2 + shaftLen + 30}" ry="${r * 0.22}" fill="#000" opacity="0.45" filter="url(#s${id})"/>
      ${shaftL}
      <path d="${body}" fill="url(#rub${id})"/>
      <path d="${body}" fill="#000" filter="url(#n${id})" opacity="0.5"/>
      ${ground ? `<path d="${body}" fill="url(#gr${id})"/>` : ""}
      ${worn ? `<path d="M${x1 + 40} ${cy + r * 0.2} C ${x1 + 200} ${cy + r * 0.05}, ${x2 - 220} ${cy + r * 0.32}, ${x2 - 40} ${cy + r * 0.15}" stroke="#77756e" stroke-width="${r * 0.28}" fill="none" opacity="0.28"/><ellipse cx="${x1 + (x2 - x1) * 0.55}" cy="${cy - r * 0.25}" rx="${(x2 - x1) * 0.18}" ry="${r * 0.12}" fill="#8a877f" opacity="0.18"/>` : ""}
      <ellipse cx="${x2}" cy="${cy}" rx="${e}" ry="${r}" fill="url(#face${id})"/>
      <ellipse cx="${x2}" cy="${cy}" rx="${e * 0.8}" ry="${r * 0.8}" fill="#6b7277"/><ellipse cx="${x2}" cy="${cy}" rx="${e * 0.74}" ry="${r * 0.74}" fill="#4b5155"/>
      ${shaftR}
      ${crack ? `<path d="M${x2 - 70} ${cy - r + 4} l-6 ${r * 0.18} l9 ${r * 0.14} l-11 ${r * 0.2} l7 ${r * 0.16} l-9 ${r * 0.22} l5 ${r * 0.18}" stroke="#0a0a0a" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M${x2 - 70} ${cy - r + 4} l-6 ${r * 0.18} l9 ${r * 0.14} l-11 ${r * 0.2} l7 ${r * 0.16} l-9 ${r * 0.22} l5 ${r * 0.18}" stroke="#8d8a82" stroke-width="1.6" fill="none" transform="translate(2 -1)"/><path d="M${x2 - 64} ${cy - r * 0.35} l-26 ${r * 0.08} M${x2 - 70} ${cy + r * 0.1} l-20 -${r * 0.1}" stroke="#7d7a72" stroke-width="1.2"/>` : ""}`;
  }
  const vblock = (id, x, top) => `<path d="M${x - 46} 470 L${x - 30} ${top} L${x - 12} ${top} L${x} ${top + 18} L${x + 12} ${top} L${x + 30} ${top} L${x + 46} 470 Z" fill="#2f5d8a"/><path d="M${x - 46} 470 L${x - 30} ${top} L${x - 12} ${top} L${x} ${top + 18} L${x + 12} ${top} L${x + 30} ${top} L${x + 46} 470 Z" fill="#000" filter="url(#n${id})" opacity="0.3"/><rect x="${x - 54}" y="468" width="108" height="10" rx="2" fill="#24496d"/>`;
  function photo(kind) {
    const id = ++uid;
    if (kind === "cilindro") return frame(`${defs(id)}${shop(id)}${vblock(id, 230, 352)}${vblock(id, 570, 352)}${cyl(id, { x1: 170, x2: 600, cy: 300, r: 78, crack: true, worn: true, shaftLen: 80, floor: 474 })}<rect width="800" height="600" fill="url(#vig${id})"/>`, "Foto sintética: cilindro de borracha preta sobre cavaletes, com trinca perto da ponta");
    if (kind === "trena") {
      const ticks = Array.from({ length: 31 }, (_, i) => `<line x1="${130 + i * 17}" y1="294" x2="${130 + i * 17}" y2="${i % 5 === 0 ? 308 : 301}" stroke="#141414" stroke-width="1.6"/>${i % 10 === 0 ? `<text x="${132 + i * 17}" y="318" font-size="11" font-weight="700" font-family="Source Sans 3, sans-serif" fill="#141414">${i * 4}</text>` : ""}`).join("");
      return frame(`${defs(id)}${shop(id, { bench: true })}${cyl(id, { x1: 120, x2: 660, cy: 268, r: 66, worn: true, shaftLen: 60, floor: 348 })}<g transform="rotate(-1.2 400 300)"><rect x="118" y="288" width="540" height="34" rx="2" fill="#f0c419"/><rect x="118" y="288" width="540" height="34" fill="#000" filter="url(#n${id})" opacity="0.15"/>${ticks}</g><g transform="translate(60 268) rotate(-8)"><rect width="78" height="78" rx="16" fill="#1e1e1e"/><rect x="6" y="6" width="66" height="66" rx="13" fill="#c4302b"/><circle cx="39" cy="39" r="14" fill="#1e1e1e"/></g><rect width="800" height="600" fill="url(#vig${id})"/>`, "Foto sintética: rolo gasto sobre a bancada, com trena ao longo da borracha");
    }
    if (kind === "ponta") return frame(`${defs(id)}${shop(id)}${cyl(id, { x1: -200, x2: 420, cy: 300, r: 150, worn: true, shaftLen: 230, shaft: 0.3 })}
      <g transform="translate(560 170)"><rect x="0" y="0" width="26" height="300" rx="3" fill="url(#stl${id})"/><path d="M26 54 h96 v14 h-70 v8 h-26z" fill="url(#stl${id})"/><path d="M26 236 h96 v-14 h-70 v-8 h-26z" fill="url(#stl${id})"/><rect x="-36" y="96" width="74" height="96" rx="10" fill="#202428"/><rect x="-28" y="108" width="58" height="30" rx="4" fill="#b9d3b5"/><text x="1" y="130" font-size="20" font-family="ui-monospace, monospace" text-anchor="middle" fill="#1d2a1c">40,1</text><circle cx="-12" cy="166" r="8" fill="#c4302b"/><circle cx="14" cy="166" r="8" fill="#3a3f44"/></g>
      <rect width="800" height="600" fill="url(#vig${id})"/>`, "Foto sintética: paquímetro digital medindo a ponta do eixo, 40,1 mm no visor");
    if (kind === "plaqueta") return frame(`${defs(id)}<rect width="800" height="600" fill="#41634f"/><rect width="800" height="600" fill="#000" filter="url(#n${id})" opacity="0.25"/><rect x="0" y="470" width="800" height="130" fill="#2e4638"/>
      <g transform="translate(150 110) rotate(-2)"><rect width="500" height="330" rx="14" fill="url(#stl${id})"/><rect width="500" height="330" rx="14" fill="#000" filter="url(#n${id})" opacity="0.22"/><rect x="10" y="10" width="480" height="310" rx="10" fill="none" stroke="#5a6166" stroke-width="2"/>${[[30, 30], [470, 30], [30, 300], [470, 300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#6b7277"/><path d="M${x - 6} ${y} h12 M${x} ${y - 6} v12" stroke="#3b4044" stroke-width="2"/>`).join("")}
      <g font-family="Source Sans 3, sans-serif" fill="#23282c"><text x="250" y="78" font-size="30" font-weight="700" text-anchor="middle">MÁQUINAS DE EXEMPLO</text><text x="250" y="104" font-size="15" text-anchor="middle">fabricante fictício</text><line x1="40" y1="124" x2="460" y2="124" stroke="#23282c" stroke-width="2"/><text x="50" y="172" font-size="21">Modelo</text><text x="240" y="172" font-size="27" font-weight="700">RX-2400</text><text x="50" y="216" font-size="21">Série</text><text x="240" y="216" font-size="24">0423</text><text x="50" y="260" font-size="21">Ano</text><text x="240" y="260" font-size="24">2016</text></g></g>
      <rect width="800" height="600" fill="url(#vig${id})"/>`, "Foto sintética: plaqueta de máquina, modelo RX-2400 de fabricante fictício");
    if (kind === "pronto") return frame(`${defs(id)}${shop(id)}${vblock(id, 230, 352)}${vblock(id, 570, 352)}${cyl(id, { x1: 170, x2: 600, cy: 300, r: 78, ground: true, shaftLen: 80, floor: 474 })}<g transform="translate(470 210) rotate(4)"><rect width="120" height="62" rx="4" fill="#f4f1e8"/><text x="10" y="22" font-size="13" font-weight="700" font-family="Source Sans 3, sans-serif" fill="#222">EX-0417</text><text x="10" y="40" font-size="12" font-family="Source Sans 3, sans-serif" fill="#222">NBR 70 ±2 Sh A</text><text x="10" y="55" font-size="11" font-family="Source Sans 3, sans-serif" fill="#555">medido: 71</text></g><rect width="800" height="600" fill="url(#vig${id})"/>`, "Foto sintética: cilindro revestido e retificado, com etiqueta da peça EX-0417");
    return frame(`${defs(id)}${shop(id)}${cyl(id, { x1: 170, x2: 600, cy: 300, r: 78 })}`, "Foto sintética");
  }

  window.Assets = { roll, photo, esc, nf };
})();
