// Conversa 3 da Sanborr (exemplo): o cliente só tem a referência da peça na máquina. O agente procura no histórico
// e em documentos públicos, monta a ficha com a fonte de cada campo, e o que as fontes discordam vira pergunta.
(function () {
  const { esc, ic, row, tr, sug, ok, pend, PDF, appwin, handoff, fillCls, stBadge } = Journey.h;
  const ORG = "Sanborr (demonstração)";
  const KB = SanborrCommon.KB;
  const WHO = "Compras e manutenção (exemplo)";
  const CHAT = [
    { step: 1, day: "Quinta, 03/12" },
    { step: 1, dir: "in", who: WHO, at: "09:12", file: "plaqueta-maquina.jpg", text: "Bom dia. Precisamos revestir o {ref|rolo puxador da posição 14} da nossa {maq|máquina RX-2400}. Não temos desenho, segue a plaqueta." },
    { step: 1, dir: "out", bot: true, who: "Atendimento", at: "09:12", srcs: ["svc"], text: "Bom dia! Vou procurar essa peça no nosso histórico e nos documentos do fabricante, e volto com uma ficha para vocês conferirem." },
    { step: 2, dir: "out", bot: true, who: "Atendimento", at: "09:14", srcs: ["hist"], text: "No nosso histórico há um rolo da mesma posição numa RX-2000, de 2025. Como o modelo é outro, não uso as medidas dele sem conferir." },
    { step: 3, dir: "out", bot: true, who: "Atendimento", at: "09:21", srcs: ["web"], text: "Achei a lista de peças do fabricante: posição 14, Ø 120 × 1.600 mm, NBR 75 Shore A. Um distribuidor fala em Ø 125. Vocês conseguem medir o diâmetro do rolo atual?" },
    { step: 4, dir: "in", who: WHO, at: "10:05", text: "{med|Medimos 124,6 mm} no rolo usado. {comp|O comprimento confere, 1.600}." },
    { step: 5, act: true, dir: "out", who: "Rafael", at: "10:30", file: "Desenho sugerido DS-0008 rev. A.pdf", text: "Ficha conferida: Ø 125 × 1.600 mm, NBR 75 Shore A. Podem mandar o rolo para a inspeção confirmar." },
    { step: 5, act: true, dir: "in", who: WHO, at: "10:41", text: "{okr|Combinado, mandamos hoje.}" },
  ];
  const LINKS = {
    "wa-cos": ["WhatsApp (Meta)", "Cosmika", "real", "Referência e foto da plaqueta"],
    "cos-atd": ["Cosmika", "Atendimento", "build", "Pedido de ficha por referência"],
    "atd-pro": ["Atendimento", "Propostas técnicas", "build", "Busca no histórico de peças"],
    "web-pro": ["Busca na web pelo agente", "Propostas técnicas", "prop", "Documentos públicos com endereço e data"],
    "pro-atd": ["Propostas técnicas", "Atendimento", "prop", "Ficha com a fonte de cada campo"],
    "atd-cos": ["Atendimento", "Cosmika", "build", "Envio aprovado por uma pessoa"],
    "cos-wa": ["Cosmika", "WhatsApp (Meta)", "real", "Ficha e desenho ao cliente"],
  };
  const spec3d = JSON.stringify({ L: 1600, D: 125, shaftD: 45, shaftL: 140, color: 0x4e534f }).replace(/"/g, "&quot;");
  const res = (id, h, u, what, b, done) => `<div class="res-item ${fillCls(3, done)}" data-f="${id}"><span class="h">${esc(h)}${b}</span><span class="u">${esc(u)}</span><span>${what}</span></div>`;

  const STEPS = [
    {
      group: "Comercial · por referência", t: "Referência", app: "atendimento", links: ["wa-cos", "cos-atd"], kb: ["svc", "cosm"],
      antes: [["Busca manual", "Sem desenho, alguém tenta achar a peça pelo modelo da máquina, por telefone ou internet"]],
      depois: [["Agente", "O agente lê a plaqueta e a posição, e começa a busca na hora"]],
      who: "O agente reconhece que é um pedido por referência e lê modelo e série na foto da plaqueta.",
      never: "O que a foto mostra é tratado como pista, não como medida.",
      real: "Atendimento pela Cosmika: funciona hoje. Leitura da plaqueta e busca por referência: proposta.",
      screen: () => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0020</code><span class="badge b-info">Por referência</span><span>Papel e cartão de exemplo</span></div><h2>Peça pela referência da máquina</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>O que o cliente passou</h3></div><div class="rows">
          ${row("maq", "Máquina", "RX-2400, série 0423, 2016", `${tr("máquina RX-2400")} · plaqueta na foto`, sug)}
          ${row("ref", "Peça", "Rolo puxador, posição 14", tr("rolo puxador da posição 14"), "")}
          ${row("des", "Desenho", null, "Não tem", pend, "", "Montar pela referência")}</div></div>
          <div class="box fit"><div class="box-head"><h3>Plaqueta</h3></div><div class="box-body"><button class="ph-img" data-file="plaqueta-maquina.jpg" aria-label="Abrir a foto da plaqueta">${Assets.photo("plaqueta")}</button><p class="meta">Imagem sintética de um fabricante fictício.</p></div></div></div>`),
    },
    {
      group: "Comercial · por referência", t: "Base interna", app: "propostas", links: ["atd-pro"], kb: ["hist", "propostas"],
      antes: [["Busca manual", "Procurar em pastas e planilhas antigas se a peça já passou por aqui"]],
      depois: [["Automático", "O histórico mostra peças da mesma posição e de modelos parecidos"], ["Registro", "O parecido fica marcado como parecido, não como igual"]],
      who: "O app procura no histórico de peças por modelo, posição e medidas parecidas.",
      never: "Peça de outro modelo não empresta medida sem uma pessoa conferir.",
      real: "Histórico de peças: em construção. Busca por referência: proposta.",
      screen: () => appwin("propostas", `<div class="screen-title"><div class="idline"><span class="badge b-info">Busca no histórico</span><span>RX-2400 · posição 14</span></div><h2>O que já passou por aqui</h2></div>
        <div class="box fit"><div class="box-body" style="overflow:auto"><table class="tbl"><thead><tr><th>Peça</th><th>Máquina e posição</th><th>Medidas</th><th>Serviço</th><th>Semelhança</th></tr></thead><tbody>
          <tr><td><code>EX-0180</code></td><td>RX-2000 · pos. 14</td><td>Ø 125 × 1.400 mm</td><td>Revestimento NBR 75, 08/2025</td><td><span class="badge b-pend">Modelo diferente</span></td></tr>
          <tr><td><code>EX-0212</code></td><td>RX-2400 · pos. 13</td><td>Ø 90 × 1.600 mm</td><td>Sem revestimento, 10/2025</td><td><span class="badge b-pend">Posição diferente</span></td></tr></tbody></table>
          <p class="note">${ic.info}<span>Nenhuma peça igual. O comprimento da RX-2400 (1.600) aparece na posição 13; o diâmetro da posição 14 aparece na RX-2000. Pistas, não medidas.</span></p></div></div>`),
    },
    {
      group: "Comercial · por referência", t: "Busca na web", app: "propostas", links: ["web-pro"], kb: ["web", "elast"], fill: { sel: "#res .res-item.wait", attr: "data-f" },
      antes: [["Busca manual", "Procurar manual e distribuidor na internet, abrir PDF por PDF"], ["Sem registro", "De onde veio cada medida fica na cabeça de quem buscou"]],
      depois: [["Agente", "O agente busca documentos públicos e extrai as medidas"], ["Registro", "Cada medida guarda o endereço e a data da consulta"]],
      who: "O agente procura documentos públicos do fabricante e de distribuidores e extrai as medidas de cada um.",
      never: "Opinião de fórum não vira dado. Fontes que discordam viram pergunta ao cliente.",
      real: "Proposta. As fontes abaixo são fictícias, com endereços .example.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><span class="badge b-info">Busca do agente</span><span>3 fontes · 03/12 09:15</span></div><h2>Documentos públicos sobre a peça</h2></div>
        <div class="cols wide-left"><div class="box"><div class="box-head"><h3>Resultados</h3><span class="meta">Fictícios</span></div><div class="box-body res" id="res">
          ${res("r1", "Lista de peças do fabricante", "manual-rx2400.example/pecas.pdf", `Pos. 14: Ø 120 × 1.600 mm, eixo Ø 45, NBR 75 Shore A. ${PDF("Manual RX-2400, lista de peças.pdf")}`, `<span class="badge b-info">Fabricante</span>`, done)}
          ${res("r2", "Distribuidor de peças", "distribuidor.example/rx2400/pos-14", "Rolo puxador RX-2400: Ø 125 × 1.600 mm, eixo Ø 45.", `<span class="badge">Distribuidor</span>`, done)}
          ${res("r3", "Fórum de manutenção", "forum-manutencao.example/t/rx2400", "Um usuário diz que trocou por NBR 80. Opinião, não usada como dado.", `<span class="badge b-pend">Não usada</span>`, done)}</div></div>
          <div class="box fit"><div class="box-head"><h3>O que bate e o que não bate</h3></div><div class="rows">
            <div class="r"><span class="l">Comprimento</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Bate</span><span class="v">1.600 mm</span><span class="s">Fabricante e distribuidor</span></div>
            <div class="r"><span class="l">Eixo</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Bate</span><span class="v">Ø 45 mm</span><span class="s">Fabricante e distribuidor</span></div>
            <div class="r"><span class="l">Diâmetro</span><span class="chk bad" style="grid-column:2;grid-row:1/span 2">${ic.help}Diverge</span><span class="v">Ø 120 ou Ø 125</span><span class="s">Pergunta ao cliente: medir o rolo atual</span></div></div></div></div>`),
    },
    {
      group: "Comercial · por referência", t: "Ficha montada", app: "propostas", links: ["pro-atd"], kb: ["web", "hist"],
      antes: [["Retrabalho", "Uma medida errada de catálogo vira peça errada"]],
      depois: [["Registro", "Desenho e 3D saem da ficha, com a divergência marcada"], ["Agente", "A medição do cliente resolve a dúvida, com o trecho"]],
      who: "O app monta o desenho e o 3D da ficha. A medição do cliente desempata o diâmetro.",
      never: "A divergência não é resolvida escolhendo a fonte mais conveniente.",
      real: "Proposta.",
      screen: () => appwin("propostas", `<div class="screen-title"><div class="idline"><code>DS-0008 rev. A</code><span class="badge b-pend">A confirmar</span></div><h2>Ficha pela referência</h2></div>
        <div class="cols wide-left"><div class="box fit"><div class="box-head"><h3>Desenho</h3>${PDF("Desenho sugerido DS-0008 rev. A.pdf")}</div><div class="box-body">${Assets.roll({ L: 1600, D: 125, shaftD: 45, shaftL: 140, coreD: 98, title: "Desenho por referência · a confirmar", code: "DS-0008", rev: "A", material: "NBR (fabricante)", hardness: "75 Shore A (fabricante)", stamp: "Ø pela medição do cliente", highlight: ["D"], notes: ["Ø 125: distribuidor e medição (124,6, gasto).", "Fabricante: Ø 120, revisão antiga do manual?", "Fontes guardadas com endereço e data."] })}</div></div>
          <div class="box fit"><div class="box-head"><h3>3D</h3><span class="meta">Arraste para girar</span></div><div class="box-body"><div class="v3d" style="height:200px" data-spec="${spec3d}" data-label="Modelo 3D do rolo puxador"><span class="hint">Ø 125 × 1.600 mm</span></div>
            <div class="rows">${row("d", "Diâmetro", "Ø 125 mm", `${tr("Medimos 124,6 mm")} · rolo gasto`, ok)}${row("c", "Comprimento", "1.600 mm", tr("O comprimento confere, 1.600"), ok)}</div></div></div></div>`),
    },
    {
      group: "Comercial · por referência", t: "Ficha conferida", app: "atendimento", act: "Aprovar e mandar a ficha", links: ["atd-cos", "cos-wa"], kb: ["cosm"], toast: "Ficha enviada; o cliente vai mandar o rolo.",
      antes: [["Manual", "A conversa sobre medidas se espalha entre telefone, e-mail e WhatsApp"]],
      depois: [["Aprovação", "Uma pessoa aprova a ficha e o texto antes do envio"], ["Registro", "A ficha conferida segue para a inspeção e o orçamento"]],
      who: "Uma pessoa aprova a ficha e o texto. A peça vem para a inspeção, e o percurso segue como na conversa com desenho.",
      never: "A ficha não vai ao cliente sem aprovação.",
      real: "Envio pela Cosmika com aprovação: em construção.",
      screen: (done) => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0020</code><span class="badge ${done ? "b-ok" : "b-pend"}">${done ? "Ficha enviada" : "A aprovar"}</span></div><h2>${done ? "Cliente vai mandar o rolo" : "Mandar a ficha conferida?"}</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>Ficha</h3></div><div class="rows">
          ${row("a", "Medidas", "Ø 125 × 1.600 mm, eixo Ø 45", "Distribuidor, fabricante e medição do cliente", ok)}
          ${row("b", "Revestimento", "NBR 75 Shore A", "Lista de peças do fabricante", ok)}
          ${row("c", "Confirmação final", null, "Na inspeção da peça", pend, "", "Na inspeção")}</div></div>
          <div class="box fit"><div class="box-body"><p class="meta" style="margin-bottom:4px">Texto que o cliente vai receber</p><div class="final">Ficha conferida: Ø 125 × 1.600 mm, NBR 75 Shore A. Podem mandar o rolo para a inspeção confirmar.</div>${PDF("Desenho sugerido DS-0008 rev. A.pdf")}
            <p><a class="btn btn-outline" href="percurso-sanborr.html#etapa-3">Ver a inspeção na conversa com desenho${ic.chev}</a></p></div></div></div>`),
    },
  ];
  Journey.start({ FILES: SanborrCommon.FILES, PLATFORM: SanborrCommon.PLATFORM, scenarios: SanborrCommon.SCENARIOS, more: SanborrCommon.more(3), scenario: "ref", menu: true, compare: true,
    compareSummary: "Por referência, hoje alguém procura manual e distribuidor à mão, e a origem de cada medida se perde. Com o Resto, o agente busca, cita a fonte e transforma divergência em pergunta. Processo atual a confirmar com a empresa.",
    key: "pcs-ref", org: ORG, contact: "Papel e cartão de exemplo", contactInitials: "PC", contactSub: "Por referência · WhatsApp na Cosmika", title: "Percurso Sanborr", sub: "Conversa 3 de 3 · peça por referência", pageTitle: "Percurso Sanborr: peça por referência", KB, CHAT, LINKS, STEPS });
})();
