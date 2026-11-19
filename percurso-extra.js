// Painéis do percurso: anexos abertos num visualizador, detalhe de cada fonte de conhecimento,
// menu da plataforma com seus módulos e a lista de conversas de exemplo.
(function () {
  const { esc, icons: ic, openDialog, dlgHead, toast } = Kit;
  const stBadge = (k) => Journey.h.stBadge(k);
  const KIND = { privado: "Da empresa, privado", publico: "Pública", dados: "Dados de sistema da empresa" };
  let PRIV = null;
  // Versão pública: sem material real.
  const realGroup = (id) => PRIV?.groups.find((g) => g.id === id);
  const realHTML = (id) => { const g = realGroup(id); if (!g) return ""; return `<section class="real"><div class="real-h"><h3>Material real da Sanborr</h3><span class="badge b-pend">Só nesta máquina</span></div><p class="meta">${esc(g.t)}</p><div class="real-grid">${g.items.map((it, i) => `<button class="real-th" data-real="${id}" data-i="${i}" aria-label="Abrir: ${esc(it.t)}"><img src="${esc(it.src)}" alt="" loading="lazy"><span>${esc(it.t)}</span></button>`).join("")}</div></section>`; };
  function openReal(id, i) {
    const g = realGroup(id), it = g?.items[i]; if (!it) return;
    const d = openDialog(`${dlgHead(esc(it.t), esc(g.t))}<div class="dlg-body viewer"><div class="canvas"><img src="${esc(it.src)}" alt="${esc(it.t)}"></div>
      <div class="mod-top">${i > 0 ? `<button class="btn btn-outline btn-sm" data-real="${id}" data-i="${i - 1}">Anterior</button>` : ""}${i < g.items.length - 1 ? `<button class="btn btn-outline btn-sm" data-real="${id}" data-i="${i + 1}">Próxima</button>` : ""}<span class="grow"></span>${it.pdf ? `<a class="btn btn-outline btn-sm" href="${esc(it.pdf)}" target="_blank" rel="noopener">Abrir o PDF original</a>` : ""}<span class="meta">${i + 1} de ${g.items.length}</span></div>
      <p class="meta">${esc(PRIV.note)}</p></div>`, { wide: true });
    d.className = "page";
  }

  // ---------- anexos ----------
  function openFile(name) {
    name = String(name).split(" · ")[0];
    const F = (Journey.cfg().FILES || {})[name];
    if (!F) { openDialog(`${dlgHead(esc(name), "Anexo")}<div class="dlg-body"><p>Anexo de exemplo sem prévia.</p></div>`); return; }
    const body = F.render();
    openDialog(`${dlgHead(esc(F.title || name), esc(F.sub || name))}<div class="dlg-body viewer"><div class="canvas">${body}</div>${F.note ? `<p class="meta">${F.note}</p>` : ""}
      ${F.realGroup ? realHTML(F.realGroup) : ""}</div>`, { wide: true });
  }

  // ---------- conhecimento ----------
  function usedIn(k) {
    const { chat, steps } = Journey.state();
    const ns = [...new Set(chat.filter((m) => (m.srcs || []).includes(k)).map((m) => m.step))];
    const extra = steps.map((s, i) => ((s.kb || []).includes(k) ? i + 1 : 0)).filter(Boolean);
    return [...new Set([...ns, ...extra])].sort((a, b) => a - b).map((n) => `<a href="#etapa-${n}" data-close>${n}. ${esc(steps[n - 1].t)}</a>`);
  }
  function openKB(k) {
    const x = Journey.state().kb[k]; if (!x) return;
    const used = usedIn(k);
    const sample = x.sample ? `<div class="sample"><p class="k" style="font-size:.75rem;font-weight:600;color:var(--muted-foreground)">${esc(x.sample.title || "Trecho de exemplo")}</p>${x.sample.cols ? `<table><thead><tr>${x.sample.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${x.sample.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` : `<p>${esc(x.sample.text)}</p>`}</div>` : "";
    if (x.full) {
      const dp = openDialog(`${dlgHead(esc(x.t), `${KIND[x.kind || "privado"]} · ${esc(x.where)}`)}<div class="dlg-body kbf">
        <div class="kbf-top"><div class="chips">${stBadge(x.st)}<span class="badge ${x.kind === "publico" ? "b-info" : ""}">${x.kind === "publico" ? "Fonte pública" : x.kind === "dados" ? "Leitura de sistema" : "Só a empresa vê"}</span>${x.owner ? `<span class="badge">Mantém: ${esc(x.owner)}</span>` : ""}${x.updated ? `<span class="badge">${esc(x.updated)}</span>` : ""}</div>
          <p class="meta">${x.use ? `Como o agente usa: ${esc(x.use)}` : ""}${used.length ? ` · Etapas: ${used.join(" · ")}` : ""}</p></div>
        ${x.full()}${x.realGroup ? realHTML(x.realGroup) : ""}</div>`, { wide: true });
      dp.className = "page";
      return;
    }
    const d = openDialog(`${dlgHead(esc(x.t), KIND[x.kind || "privado"])}<div class="dlg-body">
      <div class="chips">${stBadge(x.st)}<span class="badge ${x.kind === "publico" ? "b-info" : ""}">${x.kind === "publico" ? "Fonte pública" : x.kind === "dados" ? "Leitura de sistema" : "Só a empresa vê"}</span></div>
      <p>${esc(x.desc || x.item)}</p>
      <dl class="dl"><dt>Onde fica</dt><dd>${esc(x.where)}</dd>${x.owner ? `<dt>Quem mantém</dt><dd>${esc(x.owner)}</dd>` : ""}${x.updated ? `<dt>Atualizada</dt><dd>${esc(x.updated)}</dd>` : ""}${x.access ? `<dt>Acesso do agente</dt><dd>${esc(x.access)}</dd>` : ""}</dl>
      ${sample}
      ${x.use ? `<div><p class="k" style="font-size:.75rem;font-weight:600;color:var(--muted-foreground)">Como o agente usa</p><p>${esc(x.use)}</p></div>` : ""}
      <div><p class="k" style="font-size:.75rem;font-weight:600;color:var(--muted-foreground)">Usada nas etapas</p><p>${used.length ? used.join(" · ") : "Nenhuma etapa deste percurso usa esta fonte."}</p></div>
      ${x.kind === "publico" ? `<p class="note">${ic.info}<span>Fonte pública vira dado só depois de uma pessoa conferir. O agente guarda o endereço e a data da consulta.</span></p>` : ""}
    </div>`);
    d.className = "drawer";
  }

  // ---------- plataforma ----------
  const NAV_IC = {
    conversas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5V16A2.5 2.5 0 0 1 4 13.5Z"/></svg>',
    contatos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.6.8 2.7 2.6 3 5.2"/></svg>',
    servicos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    financeiro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',
    personalizar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    perguntas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/></svg>',
    ajustes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  };
  function openMenu() {
    const P = Journey.cfg().PLATFORM;
    const d = openDialog(`${dlgHead(esc(P.name), esc(P.org))}<div class="dlg-body"><ul class="navlist">
      <li><button data-close aria-current="page">${NAV_IC.conversas}<span>Conversas e percurso<span class="sub">O exemplo aberto agora</span></span></button></li>
      ${PRIV ? `<li><button data-real="desenhos" data-i="0">${NAV_IC.servicos}<span>Material recebido da Sanborr<span class="sub">Desenhos e planilhas reais, só nesta máquina</span></span></button></li>` : ""}
      ${P.modules.map((m) => `<li><button data-module="${m.id}">${NAV_IC[m.id]}<span>${esc(m.t)}<span class="sub">${esc(m.sub)}</span></span>${stBadge(m.st)}</button></li>`).join("")}
    </ul><p class="note">${ic.info}<span>Telas de exemplo com dados sintéticos. Cada módulo mostra de onde vêm os dados.</span></p></div>`);
    d.className = "drawer left";
  }
  const fmtMoney = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const badge = (t, c = "") => `<span class="badge ${c}">${esc(t)}</span>`;
  function moduleHTML(id, filter) {
    const P = Journey.cfg().PLATFORM, m = P.modules.find((x) => x.id === id);
    const seg = (opts) => `<div class="seg" role="group" aria-label="Filtro">${opts.map((o) => `<button data-filter="${o}" data-mod="${id}" aria-pressed="${o === filter}">${esc(o)}</button>`).join("")}</div>`;
    let body = "";
    if (id === "contatos") {
      const rows = P.contatos.filter((c) => filter === "Todos" || c.tipo === filter);
      body = `<div class="mod-top">${seg(["Todos", "Cliente", "Novo", "Prospecção"])}<span class="grow"></span><span class="meta">${rows.length} de ${P.contatos.length}</span></div>
        <div style="overflow:auto"><table class="tbl"><thead><tr><th>Empresa</th><th>Contato</th><th class="hide-sm">Origem</th><th class="hide-sm">Último serviço</th><th>Situação</th></tr></thead><tbody>
        ${rows.map((c) => `<tr><td><strong>${esc(c.empresa)}</strong><span class="sub">${esc(c.segmento)}</span></td><td>${esc(c.contato)}<span class="sub">${esc(c.canal)}</span></td><td class="hide-sm">${esc(c.origem)}</td><td class="hide-sm">${esc(c.ultimo)}</td><td>${badge(c.tipo, c.tipo === "Cliente" ? "b-ok" : c.tipo === "Novo" ? "b-info" : "")}</td></tr>`).join("")}</tbody></table></div>`;
    } else if (id === "servicos") {
      const rows = P.servicos.filter((s) => filter === "Todos" || s.grupo === filter);
      body = `<div class="mod-top">${seg(["Todos", "Comercial", "Produção", "Entregue"])}<span class="grow"></span><span class="meta">${rows.length} de ${P.servicos.length}</span></div>
        <div style="overflow:auto"><table class="tbl"><thead><tr><th>Serviço</th><th>Cliente</th><th class="hide-sm">Peças</th><th>Etapa</th><th class="hide-sm">Proposta</th><th>Entrega</th></tr></thead><tbody>
        ${rows.map((s) => `<tr><td><code>${esc(s.cod)}</code><span class="sub">${esc(s.servico)}</span></td><td>${esc(s.cliente)}</td><td class="hide-sm">${esc(s.pecas)}</td><td>${badge(s.etapa, s.grupo === "Entregue" ? "b-ok" : s.grupo === "Produção" ? "b-info" : "b-pend")}</td><td class="hide-sm">${esc(s.proposta)}</td><td>${esc(s.entrega)}</td></tr>`).join("")}</tbody></table></div>`;
    } else if (id === "financeiro") {
      const rows = P.faturas.filter((f) => filter === "Todos" || f.status === filter);
      const sum = (st) => P.faturas.filter((f) => f.status === st).reduce((a, f) => a + f.valor, 0);
      body = `<div class="kpis"><div class="kpi"><span class="l">A vencer</span><span class="v">${fmtMoney(sum("A vencer"))}</span><span class="l">${P.faturas.filter((f) => f.status === "A vencer").length} faturas</span></div><div class="kpi"><span class="l">Vencido</span><span class="v">${fmtMoney(sum("Vencida"))}</span><span class="l">${P.faturas.filter((f) => f.status === "Vencida").length} fatura</span></div><div class="kpi"><span class="l">Recebido no mês</span><span class="v">${fmtMoney(sum("Paga"))}</span><span class="l">${P.faturas.filter((f) => f.status === "Paga").length} faturas</span></div></div>
        <div class="mod-top">${seg(["Todos", "A vencer", "Vencida", "Paga"])}<span class="grow"></span><span class="meta">Somas das faturas de exemplo abaixo</span></div>
        <div style="overflow:auto"><table class="tbl"><thead><tr><th>Nota</th><th>Cliente</th><th class="hide-sm">Serviço</th><th class="num">Valor</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>
        ${rows.map((f) => `<tr><td><code>${esc(f.nota)}</code><span class="sub">${esc(f.forma)}</span></td><td>${esc(f.cliente)}</td><td class="hide-sm">${esc(f.servico)}</td><td class="num">${fmtMoney(f.valor)}</td><td>${esc(f.venc)}</td><td>${badge(f.status, f.status === "Paga" ? "b-ok" : f.status === "Vencida" ? "b-bad" : "b-pend")}</td></tr>`).join("")}</tbody></table></div>
        <p class="note">${ic.info}<span>${esc(P.finNote)}</span></p>`;
    } else if (id === "perguntas") {
      body = `<div class="faq">${(Journey.cfg().FAQ || []).map(([q, a, href]) => `<details class="faq-i"><summary>${esc(q)}</summary><p>${esc(a)}</p>${href ? `<a class="btn btn-outline btn-sm" href="${href}" data-close>Ver no percurso${ic.chev}</a>` : ""}</details>`).join("")}</div>
        <p class="note">${ic.info}<span>Perguntas feitas por Luiz e Wallace na call de 18/11. As respostas descrevem o desenho da solução; o que já funciona e o que é proposta aparece em cada etapa.</span></p>`;
    } else if (id === "personalizar") {
      body = persHTML();
    } else if (id === "ajustes") {
      body = `<div class="setgrid">${P.ajustes.map((a) => `<section class="setcard"><h3>${esc(a.t)}</h3>${a.items.map(([l, v, st]) => `<div class="r" style="padding:4px 0;border:0;display:flex;justify-content:space-between;gap:8px;align-items:center"><span>${esc(l)}<span class="sub" style="display:block;font-size:.75rem;color:var(--muted-foreground)">${esc(v)}</span></span>${st ? stBadge(st) : ""}</div>`).join("")}</section>`).join("")}</div>`;
    }
    return { title: m.t, sub: `${P.name} · ${m.src}`, body };
  }
  // ---------- personalizar ----------
  const pers = { tab: "agente", text: 0, added: false, flow: { aprov: true, insp: true, aviso: false }, req: 0, approved: false };
  const TEXTS = [
    ["Resposta: não sei medir", "Sem problema. Este vídeo curto mostra como medir o comprimento da borracha e o diâmetro de fora. Uma foto com a trena encostada já ajuda."],
    ["Boas-vindas do agente", "Olá! Aqui é o atendimento da Sanborr. Me conta qual peça precisa revestir ou recuperar; se tiver foto ou desenho, pode mandar."],
    ["Template: proposta", "Olá, {{1}}! Segue a proposta {{2}}. Fico à disposição para qualquer ajuste."],
    ["Aviso de entrega", "As peças estão prontas e saem na rota de {{dia}}. Segue o guia de uso e armazenamento."],
  ];
  const FIELDS = [["Nota de remessa", "Sim", "Administrativo"], ["Código individual", "Sim", "Automático"], ["Dimensões medidas", "Sim", "Inspeção"], ["Dureza da borracha antiga", "Sim", "Inspeção"], ["Avarias e fotos", "Sim", "Inspeção"], ["Desmontagem", "Não", "Inspeção"], ["Tempo de inspeção", "Sim", "Inspeção"]];
  const STEPS_REQ = ["Entendi o pedido: campo novo na ficha e no cálculo do volume", "Alterei a ficha de inspeção e a conta do material", "Os testes automáticos passaram", "Versão de teste pronta para vocês conferirem"];
  function persHTML() {
    const tabs = [["agente", "Pedir ao agente"], ["textos", "Textos"], ["campos", "Campos"], ["conhecimento", "Conhecimento"], ["fluxo", "Fluxo"]];
    const seg = `<div class="seg" role="group" aria-label="Personalizar">${tabs.map(([k, l]) => `<button data-pers-tab="${k}" aria-pressed="${pers.tab === k}">${l}</button>`).join("")}</div>`;
    let b = "";
    if (pers.tab === "agente") {
      b = `<div class="pers-ask"><label for="pers-q" class="k">Peça em português o que quer mudar</label><textarea id="pers-q" rows="2">Incluir o campo diâmetro interno na ficha de inspeção e usar no cálculo do volume da borracha.</textarea><div><button class="btn btn-primary" data-pers-act="ask" ${pers.req ? "disabled" : ""}>Pedir ao agente da Resto</button></div></div>
        ${pers.req ? `<div class="pers-chg"><h3>Mudança proposta pelo agente</h3><ol class="pers-steps">${STEPS_REQ.map((t, i) => `<li class="${i < pers.req ? "done" : ""}">${i < pers.req ? ic.check : '<span class="dot"></span>'}<span>${esc(t)}</span></li>`).join("")}</ol>
          ${pers.req >= STEPS_REQ.length ? (pers.approved ? `<p class="pers-ok">${ic.check}Publicado no servidor da empresa. Dá para voltar à versão anterior a qualquer momento.</p>` : `<div class="mod-top"><button class="btn btn-primary" data-pers-act="approve">Aprovar e publicar</button><span class="meta">Quem aprova: Gestão</span></div>`) : ""}</div>` : ""}
        <p class="note">${ic.info}<span>Simulação. O agente trabalha numa cópia, roda os testes e só publica depois da aprovação de alguém da empresa. Cada mudança fica no histórico.</span></p>`;
    } else if (pers.tab === "textos") {
      const [t, v] = TEXTS[pers.text];
      b = `<div class="pers-2"><ul class="navlist">${TEXTS.map(([l], i) => `<li><button data-pers-text="${i}" ${i === pers.text ? 'aria-current="page"' : ""}><span>${esc(l)}</span></button></li>`).join("")}</ul>
        <div class="pers-edit"><label for="pers-t" class="k">${esc(t)}</label><textarea id="pers-t" rows="4">${esc(v)}</textarea><p class="k">Como o cliente vê</p><div class="msg out bot" style="max-width:100%">${esc(v)}</div><div><button class="btn btn-outline" data-pers-act="save">Salvar e pedir aprovação</button></div></div></div>`;
    } else if (pers.tab === "campos") {
      const rows = [...FIELDS, ...(pers.added ? [["Diâmetro interno", "Sim", "Inspeção", true]] : [])];
      b = `<p class="meta">Ficha de inspeção. A ordem, os nomes e quem preenche são da empresa.</p><div style="overflow:auto"><table class="tbl"><thead><tr><th>Campo</th><th>Obrigatório</th><th>Quem preenche</th><th></th></tr></thead><tbody>${rows.map(([f, o, w, n]) => `<tr><td>${esc(f)}</td><td>${o}</td><td>${esc(w)}</td><td>${n ? '<span class="badge b-pend">Novo, a aprovar</span>' : ""}</td></tr>`).join("")}</tbody></table></div>
        <div><button class="btn btn-outline" data-pers-act="field" ${pers.added ? "disabled" : ""}>Adicionar o campo "Diâmetro interno"</button></div>`;
    } else if (pers.tab === "conhecimento") {
      const kb = Journey.state().kb, n = (k) => Object.values(kb).filter((x) => (x.kind || "privado") === k).length;
      b = `<div class="kpis"><div class="kpi"><span class="l">Da empresa</span><span class="v">${n("privado")}</span></div><div class="kpi"><span class="l">Públicas</span><span class="v">${n("publico")}</span></div><div class="kpi"><span class="l">Dados de sistemas</span><span class="v">${n("dados")}</span></div></div>
        <div class="setgrid"><section class="setcard"><h3>Escrever um artigo</h3><p class="meta">Texto, perguntas que ele responde e quem aprova.</p></section><section class="setcard"><h3>Enviar um arquivo</h3><p class="meta">Catálogo, tabela ou manual em PDF ou planilha. O agente lê e propõe os artigos.</p></section><section class="setcard"><h3>Corrigir uma resposta</h3><p class="meta">Na conversa, marcar a resposta e escrever o certo. Vira mudança na base, com aprovação.</p></section></div>
        <p class="meta">As fontes atuais estão na aba Conhecimento, ao lado da conversa.</p>`;
    } else {
      const tg = (k, l, d, lock) => `<label class="pers-tg"><input type="checkbox" data-pers-flow="${k}" ${pers.flow[k] ? "checked" : ""} ${lock ? "disabled" : ""}><span><strong>${esc(l)}</strong><span class="meta">${esc(d)}</span></span></label>`;
      b = `<div class="pers-flow">${tg("aprov", "Envio ao cliente pede aprovação", "Sempre ligado: nenhuma proposta sai sem uma pessoa aprovar", true)}${tg("insp", "Inspeção antes do orçamento", "O orçamento só usa medidas da inspeção ou conferidas pelo cliente")}${tg("aviso", "Aviso de entrega automático", "Quando ligado, o aviso sai sozinho depois da inspeção final aprovada")}</div>
        <p class="meta">Mudanças no fluxo também entram pelo agente, com aprovação.</p>`;
    }
    return `${seg}${b}`;
  }
  function refreshPers() { const d = document.querySelector("dialog#dlg .dlg-body"); if (d) d.innerHTML = persHTML(); }
  document.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-pers-tab],[data-pers-act],[data-pers-text]"); if (!t) return;
    if (t.dataset.persTab) { pers.tab = t.dataset.persTab; refreshPers(); document.querySelector(`[data-pers-tab="${pers.tab}"]`)?.focus(); return; }
    if (t.dataset.persText) { pers.text = Number(t.dataset.persText); refreshPers(); return; }
    const a = t.dataset.persAct;
    if (a === "save") toast("Texto enviado para aprovação do Comercial.");
    if (a === "field") { pers.added = true; refreshPers(); toast("Campo novo enviado para aprovação."); }
    if (a === "approve") { pers.approved = true; refreshPers(); toast("Mudança publicada."); }
    if (a === "ask") { for (let i = 1; i <= STEPS_REQ.length; i++) { pers.req = i; refreshPers(); await new Promise((r) => setTimeout(r, reduced ? 0 : 700)); } document.querySelector('[data-pers-act="approve"]')?.focus(); }
  });
  document.addEventListener("change", (e) => { const t = e.target.closest("[data-pers-flow]"); if (t) { pers.flow[t.dataset.persFlow] = t.checked; toast("Mudança no fluxo enviada para aprovação."); } });

  function openModule(id, filter = "Todos") {
    const { title, sub, body } = moduleHTML(id, filter);
    const d = openDialog(`${dlgHead(esc(title), esc(sub))}<div class="dlg-body">${body}</div>`, { wide: true });
    d.className = "page";
  }

  // ---------- conversas ----------
  function openConvs() {
    const C = Journey.cfg();
    const d = openDialog(`${dlgHead("Conversas", "Três clientes de exemplo, cada um num cenário")}<div class="dlg-body"><ul class="navlist convs">
      ${C.scenarios.map((s) => `<li><a href="${s.href}" ${s.id === C.scenario ? 'aria-current="page"' : ""}><span class="conv-av" aria-hidden="true">${esc(s.av)}</span><span><strong>${esc(s.who)}</strong><span class="sub">${esc(s.label)}</span><span class="sub">${esc(s.last)}</span></span></a></li>`).join("")}
    </ul></div>`);
    d.className = "drawer left";
  }

  // ---------- hoje × com o Resto ----------
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function compareHTML(n) {
    const C = Journey.cfg(), steps = Journey.state().steps, s = steps[n - 1];
    const list = (items, cls) => `<ul class="cmp-list ${cls}">${items.map(([tag, t], i) => `<li style="--i:${i}"><span class="cmp-tag">${esc(tag)}</span><span>${esc(t)}</span></li>`).join("")}</ul>`;
    const nav = steps.map((x, i) => (x.antes ? `<button class="cmp-step" data-cmp="${i + 1}" aria-pressed="${i + 1 === n}">${i + 1}. ${esc(x.t)}</button>` : "")).join("");
    return `${dlgHead("Hoje × com o Resto", `${esc(C.title)} · etapa ${n}`)}<div class="dlg-body">
      ${C.compareSummary ? `<div class="cmp-sum"><strong>No percurso inteiro</strong><p>${esc(C.compareSummary)}</p></div>` : ""}
      <div class="cmp-nav" role="group" aria-label="Etapas">${nav}</div>
      ${s.antes ? `<div class="cmp ${reduced ? "" : "anim"}"><section class="cmp-col before"><h3>Hoje</h3>${list(s.antes, "before")}</section><div class="cmp-arrow" aria-hidden="true">${ic.chev}</div><section class="cmp-col after"><h3>Com o Resto</h3>${list(s.depois, "after")}</section></div>${s.ganho ? `<p class="cmp-gain">${esc(s.ganho)}</p>` : ""}` : `<p class="meta">Esta etapa não tem comparação.</p>`}
      <p class="note">${ic.info}<span>"Hoje" resume o processo que a empresa descreveu nas mentorias. Nenhum ganho de tempo é estimado aqui.</span></p></div>`;
  }
  function openCompare(n) {
    const steps = Journey.state().steps;
    let k = n || Journey.state().cur;
    if (!steps[k - 1]?.antes) k = steps.findIndex((x) => x.antes) + 1 || 1;
    const d = openDialog(compareHTML(k));
    d.className = "drawer cmpd";
  }

  document.addEventListener("click", (e) => {
    const c = e.target.closest("#pc-compare,[data-cmp]");
    if (c) { const n = c.dataset.cmp ? Number(c.dataset.cmp) : 0; openCompare(n); if (n) document.querySelector(`dialog#dlg [data-cmp="${n}"]`)?.focus(); return; }
    const r = e.target.closest("[data-real]");
    if (r) { openReal(r.dataset.real, Number(r.dataset.i)); return; }
    const t = e.target.closest("[data-file],[data-kbopen],#pc-menu,#pc-convs,[data-module],[data-filter]");
    if (!t) return;
    if (t.dataset.file) { e.preventDefault(); openFile(t.dataset.file); return; }
    if (t.dataset.kbopen) { openKB(t.dataset.kbopen); return; }
    if (t.id === "pc-menu") { openMenu(); return; }
    if (t.id === "pc-convs") { openConvs(); return; }
    if (t.dataset.module) { openModule(t.dataset.module); return; }
    if (t.dataset.filter) { openModule(t.dataset.mod, t.dataset.filter); document.querySelector(`dialog#dlg [data-filter="${CSS.escape(t.dataset.filter)}"]`)?.focus(); }
  });
  void toast;
})();
