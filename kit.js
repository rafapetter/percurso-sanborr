// Peças comuns aos dois apps modelo: tema, armazenamento do ensaio, ícones, diálogos e avisos.
(function () {
  const q = new URLSearchParams(location.search);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento: vale só nesta visita */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* idem */ } },
  };

  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }
  const forced = q.get("tema");
  const theme = forced === "claro" ? "light" : forced === "escuro" ? "dark" : store.get("lab-theme", "light");
  applyTheme(theme);

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  // Traços do lucide (ISC).
  const icons = {
    file: I('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>'),
    list: I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    users: I('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
    plus: I('<path d="M5 12h14M12 5v14"/>'),
    upload: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>'),
    search: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    zoomIn: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>'),
    zoomOut: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>'),
    fit: I('<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'),
    marquee: I('<path d="M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1"/>'),
    external: I('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    check: I('<path d="M20 6 9 17l-5-5"/>'),
    help: I('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>'),
    clock: I('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>'),
    copy: I('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
    chev: I('<path d="m9 18 6-6-6-6"/>'),
    back: I('<path d="m15 18-6-6 6-6"/>'),
    x: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    pin: I('<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
    swap: I('<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>'),
    message: I('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
    building: I('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'),
    inbox: I('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
    target: I('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    pencil: I('<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>'),
    link: I('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    info: I('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    lock: I('<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    sliders: I('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>'),
    reply: I('<path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>'),
    calendar: I('<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    sparkle: I('<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3"/>'),
  };

  const tz = "America/Sao_Paulo";
  const fmt = {
    date: (iso) => new Intl.DateTimeFormat("pt-BR", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)),
    dateTime: (iso) => new Intl.DateTimeFormat("pt-BR", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)),
    rel: (iso) => {
      const d = new Date(iso), now = new Date();
      const day = (x) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(x);
      const t = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d);
      if (day(d) === day(now)) return `hoje, ${t}`;
      const y = new Date(now.getTime() - 864e5);
      if (day(d) === day(y)) return `ontem, ${t}`;
      return fmt.date(iso);
    },
  };

  let toastTimer;
  function toast(text) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.append(el); }
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
  }

  // Um diálogo por vez; o foco volta a quem abriu.
  let returnFocus = null;
  function openDialog(html, { wide = false, label = "dlg-title" } = {}) {
    let d = document.querySelector("dialog#dlg");
    if (!d) {
      d = document.createElement("dialog"); d.id = "dlg"; document.body.append(d);
      d.addEventListener("close", () => { if (returnFocus && document.contains(returnFocus)) returnFocus.focus(); returnFocus = null; });
      d.addEventListener("click", (e) => { if (e.target === d) d.close(); if (e.target.closest("[data-close]")) d.close(); });
    }
    if (!d.open) returnFocus = document.activeElement;
    d.className = wide ? "wide" : "";
    d.setAttribute("aria-labelledby", label);
    d.innerHTML = html;
    if (!d.open) d.showModal();
    const first = d.querySelector("[autofocus], input:not([type=hidden]), select, textarea, button:not([data-close])");
    first?.focus();
    return d;
  }
  const closeDialog = () => document.querySelector("dialog#dlg")?.close();
  const dlgHead = (title, sub = "") => `<div class="dlg-head"><div>${sub ? `<p class="meta">${sub}</p>` : ""}<h2 id="dlg-title">${title}</h2></div><button class="btn-icon" data-close aria-label="Fechar">${icons.x}</button></div>`;

  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  }

  // Faixa do lab: telas, tema e o que mais o app pedir.
  function labbar({ title, screens, current, extra = "" }) {
    const bar = document.createElement("div");
    bar.className = "labbar";
    bar.innerHTML = `<a href="./index.html">lab</a><span>${esc(title)}</span>
      <label>tela <select id="lab-screen">${screens.map(([h, l]) => `<option value="${h}" ${h === current ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      ${extra}
      <span class="grow"></span>
      <label>tema <select id="lab-theme">${[["auto", "automático"], ["light", "claro"], ["dark", "escuro"]].map(([v, l]) => `<option value="${v}" ${v === theme ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <button id="lab-reset" type="button">reiniciar ensaio</button>`;
    document.body.prepend(bar);
    bar.querySelector("#lab-theme").addEventListener("change", (e) => { store.set("lab-theme", e.target.value); applyTheme(e.target.value); });
    bar.querySelector("#lab-screen").addEventListener("change", (e) => { location.hash = e.target.value; });
    return bar;
  }
  if (q.get("captura") === "1") document.documentElement.dataset.capture = "1";

  window.Kit = { q, store, esc, icons, fmt, toast, openDialog, closeDialog, dlgHead, download, copy, labbar };
})();
