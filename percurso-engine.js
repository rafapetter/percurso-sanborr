// Mecanismo do percurso: conversa, tela do app, painel lateral e animações.
// Os dados de cada percurso ficam em outro arquivo e chamam Journey.start({...}).
(function () {
  const { store, esc, icons: ic, toast, labbar } = Kit;
  let ORG = "";
  let KB = {}, CHAT = [], LINKS = {}, STEPS = [], N = 8, KEY = "pc2";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let acted = {};
  const saveActed = () => store.set(`${KEY}-acted`, acted);
  const ui = { cur: 1, tab: "etapa", play: false, token: 0, kbUsed: new Set(), animating: false, willAnim: false };

  const MARK = {
    resto: `<svg class="brand-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="20" height="20" rx="6"/><path d="M10 19v-9h4.5a2.5 2.5 0 0 1 0 5H10M14 15l4 4"/></svg>`,
    operacao: `<svg class="brand-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h20"/><path d="M6 22V12l5 3V12l5 3V8l6 4v10"/><path d="M10 18h1M15 18h1M20 18h1"/></svg>`,
    cosmika: `<svg class="brand-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14" cy="14" r="9.5"/><path d="M9.5 15.5c1.2 1.6 2.7 2.4 4.5 2.4s3.3-.8 4.5-2.4"/><path d="M10.5 11h.01M17.5 11h.01"/></svg>`,
    atendimento: `<svg class="brand-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 7.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 7.5v6a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5V16A2.5 2.5 0 0 1 4 13.5Z"/><path d="M8.5 9.5h7M8.5 12.5h4"/><path d="M23 11.5v9a2 2 0 0 1-2 2h-6.5"/></svg>`,
    propostas: `<svg class="brand-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="21" height="18" rx="2"/><path d="M14 16.5h10.5M14 16.5V23M19.5 16.5V23"/><circle cx="9.5" cy="11.5" r="3.2"/><circle cx="9.5" cy="11.5" r="1.2"/></svg>`,
  };
  const APP = { resto: "Resto", cosmika: "Cosmika", atendimento: "Atendimento e prospecção", propostas: "Propostas técnicas", operacao: "Operação e custos" };
  const ST = { real: ["Funciona hoje", "st-real"], build: ["Em construção", "st-build"], prop: ["Proposta", "st-prop"] };
  const stBadge = (k) => `<span class="badge ${ST[k][1]}">${ST[k][0]}</span>`;

  const quote = (id) => { for (const m of CHAT) { const x = (m.text || "").match(new RegExp(`\\{${id}\\|([^}]+)\\}`)); if (x) return x[1]; } return ""; };
  const row = (id, l, v, s, b, cls = "", none = "Desconhecido") => `<div class="r ${cls}" data-f="${id}"><span class="l">${l}</span>${b || "<span></span>"}<span class="v ${v === null ? "missing" : ""}">${esc(v ?? none)}</span><span class="s">${s}</span></div>`;
  const tr = (t) => `Trecho: <q>${esc(t)}</q>`;
  const sug = '<span class="badge b-info">Sugerido pelo agente</span>';
  const ok = `<span class="badge b-ok">${ic.check}Conferido</span>`;
  const pend = '<span class="badge b-pend">Pendente</span>';
  const fileBtn = (n) => `<button type="button" class="file" data-file="${esc(n)}" aria-label="Abrir ${esc(n)}">${ic.file}<span>${esc(n)}</span></button>`;
  const PDF = (n) => fileBtn(n);
  const appwin = (app, body, banner = "") => `<section class="panel appwin" aria-label="Tela do app ${APP[app]}"><div class="appbar">${MARK[app]}<span class="nm">${APP[app]}</span><span class="org">${ORG}</span><span class="grow"></span>${STEPS[ui.cur - 1]?.st ? stBadge(STEPS[ui.cur - 1].st) : ""}<span class="badge b-sim">Exemplo</span></div><div class="appbody" id="appbody">${banner}${body}</div></section>`;
  const handoff = (t) => `<div class="handoff">${ic.swap}<span>${t}</span></div>`;
  const waitCls = (flag) => (flag || reduced || !ui.willAnim ? "in" : "wait");
  const fillCls = (n, done) => waitCls(acted[`anim${n}`] || done);
  const isActedH = (s) => !!acted[s];

  // ---------- conversa ----------
  const fmtText = (t) => esc(t).replace(/\{(\w+)\|([^}]+)\}/g, '<span class="t-src" data-t="$1">$2</span>');
  function msgHTML(m, anim) {
    if (m.day) return `<span class="day ${anim ? "enter" : ""}">${m.day}</span>`;
    return `<div class="msg ${m.dir} ${m.bot ? "bot" : ""} ${anim ? "enter" : ""}"><span class="who">${esc(m.who)}</span>${m.tpl ? `<span class="tpl">Template aprovado: ${esc(m.tpl)}</span>` : ""}${[].concat(m.file || [], m.files || []).map((f) => fileBtn(f)).join("")}${fmtText(m.text)}${m.srcs ? `<span class="srcs">${m.srcs.map((k) => `<button class="src-chip" data-kb="${k}" title="Fonte de exemplo, visível só para a equipe">${ic.file}${KB[k].t}</button>`).join("")}</span>` : ""}<span class="at">${m.at}</span></div>`;
  }
  const stepMsgs = (s, act) => CHAT.filter((m) => m.step === s && !!m.act === act);
  const isActed = (s) => !!acted[s];

  // ---------- animação ----------
  const sleep = (ms, tok, keep = false) => new Promise((res) => setTimeout(() => res(tok === ui.token), reduced && !keep ? 0 : ms));
  const chatBody = () => document.getElementById("chat-body");
  const scrollChat = () => { const c = chatBody(); if (c) c.scrollTo({ top: c.scrollHeight, behavior: reduced ? "auto" : "smooth" }); };
  async function playMsgs(list, tok) {
    for (const m of list) {
      const c = chatBody(); if (!c || tok !== ui.token) return false;
      if (m.dir && !reduced) {
        const t = document.createElement("div"); t.className = `typing ${m.dir === "in" ? "in" : ""}`; t.innerHTML = "<i></i><i></i><i></i>"; t.setAttribute("aria-hidden", "true");
        c.append(t); scrollChat();
        const alive = await sleep(m.dir === "in" ? 650 : 850, tok);
        t.remove();
        if (!alive) return false;
      }
      c.insertAdjacentHTML("beforeend", msgHTML(m, true));
      if (m.srcs) { m.srcs.forEach((k) => ui.kbUsed.add(k)); if (ui.tab === "conhecimento") refreshRail(); }
      scrollChat();
      if (!(await sleep(380, tok))) return false;
    }
    return true;
  }
  function light(id) {
    document.querySelectorAll(".t-src.lit").forEach((x) => x.classList.remove("lit"));
    const el = id && document.querySelector(`#chat-body .t-src[data-t="${id}"]`);
    if (el) { el.classList.add("lit"); const c = chatBody(); const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - c.clientHeight / 2; c.scrollTo({ top, behavior: reduced ? "auto" : "smooth" }); }
  }
  async function fillList(selector, tok, attr) {
    for (const el of document.querySelectorAll(selector)) {
      if (tok !== ui.token) return false;
      el.classList.remove("wait"); el.classList.add("in");
      light(el.getAttribute(attr));
      if (!(await sleep(420, tok))) return false;
    }
    light(null);
    return true;
  }
  async function enterStep(animate) {
    const tok = ++ui.token;
    ui.animating = animate; refreshFoot();
    const s = ui.cur;
    if (animate) {
      if (!(await playMsgs(stepMsgs(s, false), tok))) return;
      const fill = STEPS[s - 1].fill;
      if (fill && !acted[`anim${s}`] && !isActed(s)) { if (!(await fillList(fill.sel, tok, fill.attr))) return; acted[`anim${s}`] = true; saveActed(); }
    }
    ui.animating = false; refreshFoot();
    if (ui.play) autoNext(tok);
  }
  async function doAct() {
    const s = ui.cur, tok = ++ui.token;
    acted[s] = true; saveActed();
    ui.animating = true;
    renderApp(false); refreshFoot();
    const af = STEPS[s - 1].actFill;
    if (af) await fillList(af.sel, tok, af.attr);
    await playMsgs(stepMsgs(s, true), tok);
    if (tok !== ui.token) return;
    ui.animating = false; refreshFoot();
    toast(STEPS[s - 1].toast || "Feito.");
    if (ui.play) autoNext(tok);
    else document.querySelector(".rail-foot .btn-primary")?.focus();
  }
  async function autoNext(tok) {
    if (!(await sleep(reduced ? 4000 : 2200, tok, true)) || !ui.play) return;
    const s = STEPS[ui.cur - 1];
    if (s.act && !isActed(ui.cur)) return doAct();
    if (ui.cur < N) go(ui.cur + 1, true); else { ui.play = false; refreshTop(); }
  }

  // ---------- render ----------
  function renderShell() {
    document.getElementById("main").innerHTML = `<div class="pc">
      <div class="pc-top">${CFG.menu ? `<button class="btn-icon pc-menu" id="pc-menu" aria-haspopup="dialog" aria-label="Menu da plataforma"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>` : ""}<div class="pc-title"><h1>${CFG.title}</h1><span>${CFG.sub}</span></div>
        <ol class="steps" id="steps" aria-label="Etapas"></ol>
        <div class="pc-ctl">${CFG.compare ? `<button class="btn btn-outline btn-sm cmp-btn" id="pc-compare" aria-haspopup="dialog"><span class="lg">Hoje × com o Resto</span><span class="sm">Antes e depois</span></button>` : ""}<button class="btn-icon play" id="play" aria-pressed="false"></button><button class="btn-icon" data-go="-1" aria-label="Etapa anterior">${ic.back}</button><button class="btn-icon" data-go="1" aria-label="Próxima etapa">${ic.chev}</button></div></div>
      <div class="pc-stage">
        <section class="panel chat" aria-labelledby="chat-h"><div class="chat-head"><span class="av" aria-hidden="true">${CFG.contactInitials || "CD"}</span><div><strong id="chat-h">${CFG.contact || "Contato de demonstração"}</strong><span>${CFG.contactSub || "WhatsApp, como a equipe vê na Cosmika"}</span></div>${CFG.scenarios ? `<button class="btn btn-outline btn-sm convs" id="pc-convs" aria-haspopup="dialog">${CFG.scenarios.length} conversas</button>` : ""}</div><div class="chat-body" id="chat-body" role="log" aria-live="polite"></div></section>
        <div id="appslot" style="grid-area:app;min-height:0;display:flex;flex-direction:column"></div>
        <aside class="panel rail" aria-label="Detalhes da etapa"><div class="rail-tabs" role="tablist">${[["etapa", "Etapa"], ["conhecimento", "Conhecimento"], ["integracoes", "Integrações"]].map(([k, l]) => `<button role="tab" id="tab-${k}" aria-controls="rail-body" data-tab="${k}" aria-selected="${ui.tab === k}" tabindex="${ui.tab === k ? 0 : -1}">${l}</button>`).join("")}</div>
          <div class="rail-body" id="rail-body" role="tabpanel" tabindex="0"></div><div class="rail-foot" id="rail-foot"></div></aside>
      </div></div>`;
  }
  function refreshTop() {
    const more = CFG.more ? `<li class="grp" aria-hidden="true">${CFG.more.label}</li>${CFG.more.steps.map(([n, t], j) => `<li><a href="${CFG.more.href}#etapa-${n}" class="ext" title="${t} · na conversa 1"><span class="n">${N + 1 + j}</span><span class="lbl">${t}</span></a></li>`).join("")}` : "";
    document.getElementById("steps").innerHTML = STEPS.map((x, i) => `${x.group && (i === 0 || STEPS[i - 1].group !== x.group) ? `<li class="grp" aria-hidden="true">${x.group}</li>` : ""}<li><a href="#etapa-${i + 1}" class="${i + 1 < ui.cur ? "done" : ""}" ${i + 1 === ui.cur ? 'aria-current="step"' : ""} title="${x.t} · ${APP[x.app]}"><span class="n">${i + 1}</span><span class="lbl">${x.t}</span></a></li>`).join("") + more;
    document.getElementById("steps").classList.toggle("many", N + (CFG.more ? CFG.more.steps.length : 0) > 8);
    const p = document.getElementById("play");
    p.setAttribute("aria-pressed", String(ui.play));
    p.innerHTML = ui.play ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
    p.setAttribute("aria-label", ui.play ? "Pausar" : "Reproduzir o percurso sozinho");
    const a = document.querySelector('.steps a[aria-current="step"]'), list = document.getElementById("steps");
    if (a && list) list.scrollLeft = a.offsetLeft - list.clientWidth / 2 + a.offsetWidth / 2;
  }
  function renderChat(animateCurrent) {
    const before = CHAT.filter((m) => m.step < ui.cur || (m.step === ui.cur && !animateCurrent && (!m.act || isActed(ui.cur))));
    ui.kbUsed = new Set(before.flatMap((m) => m.srcs || []));
    chatBody().innerHTML = before.map((m) => msgHTML(m, false)).join("");
    chatBody().scrollTop = chatBody().scrollHeight;
  }
  let lastApp = null;
  function renderApp(swap) {
    const s = STEPS[ui.cur - 1];
    document.getElementById("appslot").innerHTML = s.screen(isActed(ui.cur));
    if (swap && !reduced && lastApp !== s.app) document.getElementById("appbody").classList.add("swap");
    lastApp = s.app;
    dispatchEvent(new CustomEvent("journey:render", { detail: { step: ui.cur } }));
  }
  function refreshFoot() {
    const s = STEPS[ui.cur - 1], f = document.getElementById("rail-foot");
    const primary = s.act && !isActed(ui.cur) ? `<button class="btn btn-primary" data-act="do" ${ui.animating ? 'aria-disabled="true"' : ""}>${ic.check}${s.act}</button>` : ui.cur < N ? `<a class="btn btn-primary" href="#etapa-${ui.cur + 1}">Próxima etapa${ic.chev}</a>` : CFG.more ? `<a class="btn btn-primary" href="${CFG.more.href}#etapa-${CFG.more.steps[0][0]}">Continuar: ${CFG.more.steps[0][1]}${ic.chev}</a>` : `<button class="btn btn-outline" data-act="restart">Recomeçar</button>`;
    const had = f.contains(document.activeElement);
    f.innerHTML = `<span class="cur">${ui.cur}/${N} · ${s.t}</span>${primary}`;
    if (had) f.querySelector(".btn")?.focus({ preventScroll: true });
  }
  function refreshRail() {
    const s = STEPS[ui.cur - 1], b = document.getElementById("rail-body");
    document.querySelectorAll(".rail-tabs button").forEach((x) => { x.setAttribute("aria-selected", String(x.dataset.tab === ui.tab)); x.tabIndex = x.dataset.tab === ui.tab ? 0 : -1; });
    b.setAttribute("aria-labelledby", `tab-${ui.tab}`);
    if (ui.tab === "etapa") {
      b.innerHTML = `<div><p class="k">Onde</p><span class="app-chip">${MARK[s.app]}${APP[s.app]}</span></div><div><p class="k">Quem faz</p><p>${s.who}</p></div><div><p class="k">O que nunca acontece sozinho</p><p>${s.never}</p></div><div><p class="k">O que já existe</p><p class="meta" style="font-size:.875rem">${s.real}</p></div>`;
    } else if (ui.tab === "conhecimento") {
      b.innerHTML = `<div><p class="k">O que o agente consulta</p><p class="meta" style="font-size:.875rem">Cada resposta do agente mostra a fonte. Em destaque, as fontes usadas até aqui. Conteúdo de exemplo; cada empresa cadastra o seu.</p></div>
        ${[["privado", "Da empresa"], ["publico", "Públicas"], ["dados", "Dados dos sistemas"]].map(([g, gl]) => { const items = Object.entries(KB).filter(([, x]) => (x.kind || "privado") === g); return items.length ? `<div class="kb-grp"><p class="k">${gl} · ${items.length}</p><div class="kb">${items.map(([k, x]) => `<button type="button" class="kb-item ${ui.kbUsed.has(k) ? "used" : ""}" id="kb-${k}" data-kbopen="${k}" aria-haspopup="dialog"><span class="h">${x.t}${stBadge(x.st)}</span><span>${esc(x.item)}</span><span class="m">${x.where}${ui.kbUsed.has(k) ? " · usada nesta conversa" : ""}</span></button>`).join("")}</div></div>` : ""; }).join("")}
        <p class="note">${ic.info}<span>O histórico da peça só é ligado ao pedido depois que uma pessoa confere a identidade.</span></p>`;
    } else {
      const linkHTML = (k, on) => { const [a, z, st, what] = LINKS[k]; return `<div class="link ${on ? "on" : ""} ${st}"><div class="ends"><span class="pill">${a}</span><span class="wire" aria-hidden="true"><i></i></span><span class="pill">${z}</span></div><div class="what"><span>${what}</span>${stBadge(st)}</div></div>`; };
      b.innerHTML = `<div><p class="k">Quando cada ligação acontece</p><p class="meta" style="font-size:.875rem">Na ordem do percurso. A etapa atual fica aberta; as outras mostram só o que passa de um sistema a outro.</p><div class="legend">${stBadge("real")}${stBadge("build")}${stBadge("prop")}</div></div>
        <ol class="ltl">${STEPS.map((x, i) => { const n = i + 1, cur = n === ui.cur, ls = x.links || []; const state = n < ui.cur ? "done" : cur ? "cur" : "next"; return `<li class="ltl-s ${state}"><a href="#etapa-${n}" class="ltl-h" ${cur ? 'aria-current="step"' : ""}><span class="n">${n}</span><span class="t">${x.t}</span><span class="c">${ls.length ? `${ls.length} ${ls.length === 1 ? "ligação" : "ligações"}` : "sem ligação"}</span></a>${cur ? `<div class="links">${ls.map((k) => linkHTML(k, true)).join("")}</div>` : ls.length ? `<p class="ltl-sum">${ls.map((k) => `${LINKS[k][0]} → ${LINKS[k][1]}`).join(" · ")}</p>` : ""}</li>`; }).join("")}</ol>
        <p class="note">${ic.info}<span>Nenhuma ligação proposta é mostrada como pronta. ERP e PCP dependem das interfaces que a empresa tiver.</span></p>`;
    }
  }

  function go(n, animate) {
    if (n < 1 || n > N) return;
    const forward = n === ui.cur + 1;
    ui.cur = n;
    if (location.hash !== `#etapa-${n}`) history.replaceState(null, "", `#etapa-${n}`);
    const anim = animate ?? forward;
    ui.willAnim = anim;
    const focusWas = document.activeElement?.closest?.("#steps") ? "steps" : document.activeElement?.closest?.("#rail-foot") ? "foot" : null;
    document.querySelector(".pc-stage")?.setAttribute("data-chat", STEPS[n - 1].chat || "");
    refreshTop(); renderChat(anim); renderApp(true); refreshRail(); refreshFoot();
    const sel = document.getElementById("lab-screen"); if (sel) sel.value = `#etapa-${n}`;
    if (focusWas === "steps") document.querySelector('.steps a[aria-current="step"]')?.focus();
    if (focusWas === "foot") document.querySelector("#rail-foot .btn")?.focus();
    enterStep(anim);
  }

  // ---------- eventos ----------
  addEventListener("hashchange", () => { const n = Number((location.hash.match(/etapa-(\d+)/) || [])[1]); if (n && n !== ui.cur) go(n); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act],[data-go],[data-tab],[data-kb],#play");
    if (!t) return;
    if (t.id === "play") { ui.play = !ui.play; refreshTop(); if (ui.play && !ui.animating) autoNext(++ui.token); return; }
    if (t.dataset.go) { ui.play = false; go(ui.cur + Number(t.dataset.go), Number(t.dataset.go) > 0); return; }
    if (t.dataset.tab) { ui.tab = t.dataset.tab; store.set(`${KEY}-tab`, ui.tab); refreshRail(); return; }
    if (t.dataset.kb) { ui.tab = "conhecimento"; store.set(`${KEY}-tab`, ui.tab); refreshRail(); const k = document.getElementById(`kb-${t.dataset.kb}`); k?.scrollIntoView({ block: "nearest" }); k?.focus(); return; }
    if (t.dataset.act === "do" && !ui.animating) doAct();
    if (t.dataset.act === "restart") { for (const k of Object.keys(acted)) delete acted[k]; saveActed(); ui.play = false; go(1, true); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input,textarea,select")) return;
    const tabBtn = e.target.closest?.(".rail-tabs button");
    if (tabBtn && ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); const ks = ["etapa", "conhecimento", "integracoes"]; const i = (ks.indexOf(ui.tab) + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : 2)) % 3; ui.tab = ks[i]; store.set(`${KEY}-tab`, ui.tab); refreshRail(); document.querySelector(`.rail-tabs [data-tab="${ui.tab}"]`)?.focus(); return; }
    if (e.key === "ArrowRight") { ui.play = false; go(ui.cur + 1, true); }
    if (e.key === "ArrowLeft") { ui.play = false; go(ui.cur - 1, false); }
  });

  let CFG = {};
  function start(cfg) {
    CFG = cfg; ORG = cfg.org; KB = cfg.KB; CHAT = cfg.CHAT; LINKS = cfg.LINKS; STEPS = cfg.STEPS; N = STEPS.length; KEY = cfg.key || "pc2";
    acted = store.get(`${KEY}-acted`, {});
    ui.tab = store.get(`${KEY}-tab`, "etapa");
    document.title = cfg.pageTitle || cfg.title;
    renderShell();
    ui.cur = Math.min(N, Math.max(1, Number((location.hash.match(/etapa-(\d+)/) || [])[1]) || 1));
    labbar({ title: CFG.title, screens: STEPS.map((s, i) => [`#etapa-${i + 1}`, `${i + 1}. ${s.t}`]), current: `#etapa-${ui.cur}` });
    document.getElementById("lab-reset").addEventListener("click", () => { for (const k of Object.keys(acted)) delete acted[k]; saveActed(); ui.play = false; go(1, true); toast("Percurso reiniciado."); });
    go(ui.cur, ui.cur === 1);
  }
  window.Journey = { start, cfg: () => CFG, state: () => ({ cur: ui.cur, kbUsed: ui.kbUsed, steps: STEPS, kb: KB, chat: CHAT }), h: { esc, ic, row, tr, sug, ok, pend, PDF, fileBtn, appwin, handoff, waitCls, fillCls, stBadge, quote, isActed: isActedH } };
})();
