// Conversa 2 da Sanborr (exemplo): cliente novo, sem desenho. Das fotos com trena e paquímetro sai um
// desenho sugerido com 3D; o cliente confere, a inspeção confirma, e o orçamento segue como na conversa com desenho.
(function () {
  const { esc, ic, row, tr, sug, ok, pend, PDF, appwin, handoff, fillCls, stBadge } = Journey.h;
  const ORG = "Sanborr (demonstração)";
  const KB = SanborrCommon.KB;
  const WHO = "Manutenção (exemplo)";
  const CHAT = [
    { step: 1, day: "Quarta, 02/12" },
    { step: 1, dir: "in", who: WHO, at: "14:05", file: "foto-rolo-trena.jpg", text: "Boa tarde. Temos um {serv|rolo da laminadora} com a borracha gasta. {semdes|Não temos desenho}. Dá para fazer?" },
    { step: 1, dir: "out", bot: true, who: "Atendimento", at: "14:05", srcs: ["svc"], text: "Boa tarde! Dá sim. Sem desenho, montamos um a partir de fotos e medidas, e vocês conferem antes do orçamento. Pode mandar uma foto da ponta do eixo com trena ou paquímetro?" },
    { step: 2, dir: "in", who: WHO, at: "14:20", file: "foto-ponta-eixo.jpg", text: "A borracha tem uns {comp|1,24 m}. O diâmetro de fora dá uns {diam|15 cm} e a ponta do eixo {eixo|40 mm}. É {uso|rolo de laminação, perto de água quente}." },
    { step: 2, dir: "out", bot: true, who: "Atendimento", at: "14:21", srcs: ["aplic", "elast"], text: "Obrigado. Para laminação com água quente, o usual é EPDM entre 60 e 70 Shore A. Vou montar um desenho com essas medidas para vocês conferirem." },
    { step: 3, act: true, dir: "out", who: "Rafael", at: "14:48", file: "Desenho sugerido DS-0007 rev. A.pdf", text: "Montamos este desenho a partir das fotos. Confere as medidas? A dureza a gente mede na peça quando ela chegar." },
    { step: 4, dir: "in", who: WHO, at: "15:02", text: "{corr|O comprimento é 1.250, não 1.240.} O resto está certo. Dureza não sei." },
    { step: 4, act: true, dir: "out", who: "Rafael", at: "15:06", file: "Desenho sugerido DS-0007 rev. B.pdf", text: "Corrigido para 1.250 mm. Quando o rolo chegar, a inspeção mede a dureza e confirma tudo antes da proposta." },
    { step: 4, act: true, dir: "in", who: WHO, at: "15:10", text: "{okc|É isso. O comprimento é 1.250.} Mandamos o rolo amanhã." },
  ];
  const LINKS = {
    "wa-cos": ["WhatsApp (Meta)", "Cosmika", "real", "Fotos e medidas do cliente"],
    "cos-atd": ["Cosmika", "Atendimento", "build", "Necessidades com o trecho de cada uma"],
    "atd-pro": ["Atendimento", "Propostas técnicas", "build", "Fotos e medidas para o desenho sugerido"],
    "pro-atd": ["Propostas técnicas", "Atendimento", "prop", "Desenho sugerido e 3D para o cliente conferir"],
    "atd-cos": ["Atendimento", "Cosmika", "build", "Envio aprovado por uma pessoa"],
    "cos-wa": ["Cosmika", "WhatsApp (Meta)", "real", "Desenho em PDF ao cliente"],
    "cnpj-atd": ["Cadastro público de CNPJ", "Atendimento", "prop", "Cadastro do cliente novo"],
  };
  const spec3d = (L) => JSON.stringify({ L, D: 150, shaftD: 40, shaftL: 120, color: 0x4b514d }).replace(/"/g, "&quot;");
  const dw = (rev) => Assets.roll(rev === "A"
    ? { L: 1240, D: 150, shaftD: 40, shaftL: 120, coreD: 124, title: "Desenho sugerido · a confirmar", code: "DS-0007", rev: "A", material: "EPDM (sugerido)", hardness: "60–70 Shore A (sugerido)", stamp: "Sugestão: o cliente confirma", notes: ["Medidas tiradas das fotos, ±3 mm.", "Dureza e material: sugestão para laminação."] }
    : { L: 1250, D: 150, shaftD: 40, shaftL: 120, coreD: 124, title: "Desenho sugerido · conferido pelo cliente", code: "DS-0007", rev: "B", material: "EPDM (sugerido)", hardness: "60–70 Shore A (sugerido)", highlight: ["L"], notes: ["Comprimento corrigido pelo cliente: 1.250 mm.", "Dureza: medir na inspeção."] });

  const STEPS = [
    {
      group: "Comercial · sem desenho", t: "Contato novo", app: "atendimento", links: ["wa-cos", "cos-atd", "cnpj-atd"], kb: ["svc", "cnpj", "cosm"],
      antes: [["Espera", "Sem desenho, o orçamento espera a peça chegar ou uma visita ao cliente"], ["Manual", "Cliente novo é cadastrado à mão, pedindo dado por dado"]],
      depois: [["Agente", "O agente pede as fotos certas na hora: peça inteira, ponta do eixo com medida"], ["Automático", "O cadastro sai do CNPJ público, para uma pessoa conferir"]],
      who: "O agente da Cosmika atende, explica o caminho sem desenho e pede as fotos que servem para medir.",
      never: "O agente não promete preço nem prazo, e não diz que a peça está medida.",
      real: "Atendimento pela Cosmika: funciona hoje. Cadastro pelo CNPJ: proposta.",
      screen: () => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0019</code><span class="badge b-info">Contato novo</span><span>Embalagens de exemplo · WhatsApp</span></div><h2>Cliente novo, sem desenho</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>Cadastro</h3><span class="meta">Do CNPJ público, a conferir</span></div><div class="rows">
          ${row("a", "Empresa", "Embalagens de exemplo", "Cadastro público de CNPJ (exemplo)", sug)}
          ${row("b", "Segmento", "Embalagens", "Atividade no cadastro público", sug)}
          ${row("c", "Origem", "Indicação", "Conversa", "")}</div></div>
          <div class="box fit"><div class="box-head"><h3>Caminho</h3></div><div class="box-body"><p>Sem desenho: o Propostas técnicas monta um desenho sugerido a partir das fotos. O cliente confere antes do orçamento.</p>
          <div class="photos" style="grid-template-columns:1fr 1fr"><button class="ph-img" data-file="foto-rolo-trena.jpg" aria-label="Abrir a foto com trena">${Assets.photo("trena")}</button></div></div></div></div>`),
    },
    {
      group: "Comercial · sem desenho", t: "Medidas das fotos", app: "atendimento", links: ["cos-atd", "atd-pro"], kb: ["aplic", "elast"], fill: { sel: "#med .r.wait", attr: "data-f" },
      antes: [["Redigitação", "As medidas ditas na conversa são anotadas num papel ou planilha"], ["Busca manual", "Material e dureza dependem de quem lembra o que costuma servir"]],
      depois: [["Agente", "Cada medida vem com o trecho e a foto de onde saiu"], ["Agente", "Material e dureza aparecem como sugestão da base, marcados para confirmar"]],
      who: "O agente registra cada medida com o trecho e a foto. Material e dureza ficam como sugestão.",
      never: "Sugestão não vira especificação sem o cliente ou a inspeção confirmar.",
      real: "Registro com trecho: em construção. Sugestão pela base de aplicações: proposta.",
      screen: (done) => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0019</code><span class="badge b-pend">A confirmar</span></div><h2>O que as fotos e a conversa dizem</h2></div>
        <div class="cols"><div class="box"><div class="box-head"><h3>Medidas e uso</h3><span class="meta">Cada uma com a origem</span></div><div class="rows" id="med">
          ${row("comp", "Comprimento da borracha", "1.240 mm", `${tr("1,24 m")} · foto com trena`, sug, fillCls(2, done))}
          ${row("diam", "Diâmetro externo", "Ø 150 mm", tr("15 cm"), sug, fillCls(2, done))}
          ${row("eixo", "Ponta do eixo", "Ø 40 mm", `${tr("40 mm")} · foto do paquímetro: 40,1`, sug, fillCls(2, done))}
          ${row("uso", "Uso", "Laminação, perto de água quente", tr("rolo de laminação, perto de água quente"), "", fillCls(2, done))}
          ${row("mat", "Material e dureza", "EPDM, 60–70 Shore A", "Base: aplicações e durezas usuais", sug, fillCls(2, done))}</div></div>
          <div class="box fit"><div class="box-head"><h3>Fotos</h3></div><div class="box-body"><div class="photos" style="grid-template-columns:1fr 1fr">
            <button class="ph-img" data-file="foto-rolo-trena.jpg" aria-label="Abrir a foto com trena">${Assets.photo("trena")}</button>
            <button class="ph-img" data-file="foto-ponta-eixo.jpg" aria-label="Abrir a foto do paquímetro">${Assets.photo("ponta")}</button></div>
            <p class="meta">Imagens sintéticas. Medida por foto vale ±3 mm; a inspeção confirma.</p></div></div></div>`),
    },
    {
      group: "Comercial · sem desenho", t: "Desenho e 3D", app: "propostas", act: "Mandar ao cliente para conferir", links: ["pro-atd", "atd-cos", "cos-wa"], kb: ["aplic", "hist"], toast: "Desenho sugerido enviado pela Cosmika.",
      antes: [["Espera", "Sem desenho, nada para o cliente conferir até a peça chegar"], ["Manual", "Quando alguém desenha, é à parte, num programa de CAD"]],
      depois: [["Automático", "O app gera o desenho e o 3D das medidas registradas"], ["Aprovação", "Uma pessoa aprova antes de o cliente receber"]],
      who: "O Propostas técnicas gera o desenho e o 3D a partir das medidas. Uma pessoa confere e aprova o envio.",
      never: "O desenho sugerido não é tratado como desenho do cliente. Ele vai marcado como sugestão.",
      real: "Desenho e 3D gerados das medidas: proposta. Hoje o protótipo desenha cilindros revestidos; outras formas viriam depois.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><code>DS-0007 rev. A</code><span class="badge ${done ? "b-info" : "b-pend"}">${done ? "Enviado ao cliente" : "Sugestão"}</span><span>Das medidas do ATD-0019</span></div><h2>Desenho sugerido, para o cliente conferir</h2></div>
        <div class="cols wide-left"><div class="box fit"><div class="box-head"><h3>Desenho</h3>${PDF("Desenho sugerido DS-0007 rev. A.pdf")}</div><div class="box-body">${dw("A")}</div></div>
          <div class="box fit"><div class="box-head"><h3>3D</h3><span class="meta">Arraste para girar</span></div><div class="box-body"><div class="v3d" style="height:220px" data-spec="${spec3d(1240)}" data-label="Modelo 3D do rolo sugerido"><span class="hint">Mesmas medidas do desenho</span></div>
            <p class="meta">Ø 150 × 1.240 mm de borracha, eixo Ø 40. Material e dureza seguem como sugestão.</p></div></div></div>`),
    },
    {
      group: "Comercial · sem desenho", t: "Cliente confere", app: "propostas", act: "Corrigir e enviar a revisão B", links: ["wa-cos", "cos-atd", "atd-pro", "pro-atd"], kb: ["cosm"], toast: "Revisão B enviada; o cliente confirmou.",
      antes: [["Retrabalho", "Medida errada só aparece quando a peça chega, e o orçamento é refeito"]],
      depois: [["Registro", "A correção do cliente vira a revisão B, com o trecho de onde veio"], ["Aprovação", "O envio da revisão passa por uma pessoa"]],
      who: "O cliente corrige pela conversa. O app registra a correção como revisão B do desenho, com o trecho.",
      never: "A correção não é aplicada sem uma pessoa ver de onde veio.",
      real: "Revisões do desenho com o trecho: proposta.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><code>DS-0007</code><span class="badge ${done ? "b-ok" : "b-pend"}">${done ? "Conferido pelo cliente" : "Correção recebida"}</span></div><h2>Revisão A para B</h2></div>
        <div class="cols wide-left"><div class="box fit"><div class="box-head"><h3>Desenho, revisão B</h3>${PDF("Desenho sugerido DS-0007 rev. B.pdf")}</div><div class="box-body">${dw("B")}</div></div>
          <div class="box fit"><div class="box-head"><h3>O que mudou</h3></div><div class="rows">
            <div class="r"><span class="l">Comprimento da borracha</span><span></span><span class="v">1.240 → 1.250 mm</span><span class="s">${tr("O comprimento é 1.250, não 1.240.")}</span></div>
            <div class="r"><span class="l">Dureza</span>${pend}<span class="v missing">Medir na inspeção</span><span class="s">${tr("Dureza não sei.")}</span></div>
            <div class="r"><span class="l">Confirmação</span>${done ? ok : pend}<span class="v">${done ? "Cliente confirmou a revisão B" : "Aguardando"}</span><span class="s">${done ? tr("É isso. O comprimento é 1.250.") : "Depois do envio"}</span></div></div></div></div>`),
    },
    {
      group: "Comercial · sem desenho", t: "Inspeção confirma", app: "propostas", links: ["atd-pro"], kb: ["fichas", "mat", "tempos"],
      antes: [["Retrabalho", "Medida conferida só na chegada; o que foi dito por telefone se perde"]],
      depois: [["Registro", "A ficha mostra o sugerido, o conferido pelo cliente e o medido, lado a lado"], ["Automático", "Daqui o orçamento sai das tabelas, como na conversa com desenho"]],
      who: "A inspeção mede a peça e fecha cada campo. Daqui em diante o percurso é o mesmo da conversa com desenho.",
      never: "Nenhum campo entra no orçamento só porque foi sugerido.",
      real: "Ficha de inspeção: em construção. Comparação sugerido, conferido e medido: proposta.",
      screen: () => appwin("propostas", `<div class="screen-title"><div class="idline"><code>Ficha 2612.004</code><span class="badge b-ok">Inspeção registrada</span><span>Peça EX-0431 · DS-0007 rev. B</span></div><h2>Do sugerido ao medido</h2></div>
        <div class="box fit"><div class="box-body" style="overflow:auto"><table class="tbl"><thead><tr><th>Campo</th><th>Sugerido</th><th>Cliente</th><th>Medido na inspeção</th></tr></thead><tbody>
          <tr><td>Comprimento da borracha</td><td>1.240 mm</td><td>1.250 mm</td><td><strong>1.250 mm</strong></td></tr>
          <tr><td>Diâmetro externo</td><td>Ø 150 mm</td><td>Confirmou</td><td><strong>Ø 149 mm</strong> (gasta; acabado Ø 150)</td></tr>
          <tr><td>Ponta do eixo</td><td>Ø 40 mm</td><td>Confirmou</td><td><strong>Ø 40 mm</strong></td></tr>
          <tr><td>Dureza</td><td>60–70 Shore A</td><td>Não sabia</td><td><strong>66 Shore A</strong> na borracha antiga</td></tr>
          <tr><td>Material</td><td>EPDM</td><td>—</td><td><strong>EPDM 65 ±5 Shore A</strong> (decisão técnica)</td></tr></tbody></table>
          <p class="meta">Daqui o orçamento sai das tabelas vigentes, como na conversa com desenho.</p>
          <p><a class="btn btn-outline" href="percurso-sanborr.html#etapa-4">Ver o orçamento na conversa com desenho${ic.chev}</a></p></div></div>`,
        handoff("Peça recebida e inspecionada: o desenho sugerido virou ficha com medidas confirmadas.")),
    },
  ];
  Journey.start({ FILES: SanborrCommon.FILES, PLATFORM: SanborrCommon.PLATFORM, scenarios: SanborrCommon.SCENARIOS, more: SanborrCommon.more(4), scenario: "foto", menu: true, compare: true,
    compareSummary: "Sem desenho, hoje o orçamento espera a peça chegar. Com o Resto, o cliente confere um desenho sugerido no mesmo dia, e a inspeção só confirma. Processo atual a confirmar com a empresa.",
    key: "pcs-foto", org: ORG, contact: "Embalagens de exemplo", contactInitials: "EE", contactSub: "Sem desenho · WhatsApp na Cosmika", title: "Percurso Sanborr", sub: "Conversa 2 de 3 · cliente sem desenho", pageTitle: "Percurso Sanborr: cliente sem desenho", KB, CHAT, LINKS, STEPS });
})();
