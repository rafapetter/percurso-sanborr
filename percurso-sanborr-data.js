// Percurso da Sanborr, D3 e D2 juntos: do contato no WhatsApp à entrega, passando pela ordem, pelo PCP,
// pelos apontamentos e pelo custo. Tudo sintético: cliente, peças, códigos, valores e tabelas são de exemplo,
// Os nomes dos sistemas da empresa vieram da mentoria de 18/11 e ainda serão confirmados.
(function () {
  const { esc, ic, row, tr, sug, ok, pend, PDF, appwin, handoff, fillCls, stBadge, quote, isActed } = Journey.h;
  const TEC = "Responsável técnico (exemplo)", PCPP = "PCP (exemplo)";
  const ORG = "Sanborr (demonstração)";
  const C = "Comercial · D3", O = "Operação · D2 · proposta";

  const KB = SanborrCommon.KB;

  const CHAT = [
    { step: 1, day: "Segunda, 23/11" },
    { step: 1, dir: "in", who: "Contato de demonstração", at: "08:41", file: "foto-cilindro.jpg", text: "Bom dia. Temos dois cilindros com a borracha trincada e precisamos {serv|revestir de novo}. Segue foto." },
    { step: 1, dir: "out", bot: true, who: "Atendimento", at: "08:41", srcs: ["svc"], text: "Bom dia! Fazemos revestimento e recuperação de cilindros. A foto ajuda, mas medidas e dureza saem da inspeção da peça aqui. Vocês têm o desenho ou a especificação da borracha?" },
    { step: 1, dir: "in", who: "Contato de demonstração", at: "08:47", file: "desenho-cilindro.pdf", text: "Segue o desenho. {mat|Borracha NBR}, {dur|70 Shore A}. São {qtd|2 peças iguais}." },
    { step: 2, dir: "out", bot: true, who: "Atendimento", at: "08:48", srcs: ["hist", "mat"], text: "Encontrei esse desenho no histórico de vocês com a gente. A inspeção confirma se são as mesmas peças. Podem enviar os cilindros? O orçamento sai depois da inspeção." },
    { step: 2, dir: "in", who: "Contato de demonstração", at: "08:55", text: "Mandamos {envio|amanhã pela transportadora}. São {novas|outros cilindros, do mesmo desenho}. Precisamos de volta {prazo|até 11 de dezembro}." },
    { step: 2, dir: "out", bot: true, who: "Atendimento", at: "08:55", text: "Combinado. Quando as peças chegarem, a equipe faz a inspeção e manda a proposta. Preço e prazo vêm deles." },
    { step: 3, day: "Terça, 24/11" },
    { step: 3, act: true, dir: "out", who: "Rafael", at: "15:10", tpl: "peças recebidas", text: "Recebemos os dois cilindros e já fizemos a inspeção. A proposta sai amanhã." },
    { step: 5, day: "Quarta, 25/11" },
    { step: 5, act: true, dir: "out", who: "Rafael", at: "10:20", tpl: "proposta", file: "Proposta PRO-0011 rev. 0.pdf", text: "Segue a proposta de revestimento dos dois cilindros (EX-0417 e EX-0418). Fico à disposição." },
    { step: 6, dir: "in", who: "Contato de demonstração", at: "14:02", text: "Para esta máquina precisamos da {tol|dureza com tolerância de ±2 Shore A}." },
    { step: 6, act: true, dir: "out", who: "Rafael", at: "16:30", file: "Proposta PRO-0011 rev. 1.pdf", text: "Segue a revisão 1, com tolerância de ±2 Shore A. O controle de dureza ficou mais longo e o preço mudou; o resto ficou igual." },
    { step: 7, day: "Quinta, 26/11" },
    { step: 7, dir: "in", who: "Contato de demonstração", at: "09:15", file: "Pedido de compra 8812.pdf", text: "{aceite|Aprovado. Segue o pedido de compra.}" },
    { step: 7, dir: "out", who: "Rafael", at: "09:30", text: "Obrigado! O pedido pede entrega em 11/12 e a proposta prevê 17/12. Pode ser 17/12?" },
    { step: 7, dir: "in", who: "Contato de demonstração", at: "09:41", text: "{entrega|Pode ser 17/12.}" },
    { step: 12, day: "Quinta, 17/12" },
    { step: 12, act: true, dir: "out", who: "Rafael", at: "07:30", tpl: "peças prontas", files: ["foto-cilindro-pronto.jpg", "Guia de uso e armazenamento.pdf"], text: "Os dois cilindros estão prontos e saem hoje na rota da região de vocês. Segue o guia de uso e armazenamento." },
  ];
  const FIELDS = [
    ["serv", "Serviço", "Revestimento de cilindros"], ["mat", "Material", "NBR"], ["dur", "Dureza", "70 Shore A"],
    ["qtd", "Quantidade", "2 peças iguais"], ["envio", "Envio das peças", "Transportadora, 24/11"], ["prazo", "Prazo pedido", "Até 11/12/2026"],
  ];

  const LINKS = {
    "wa-cos": ["WhatsApp (Meta)", "Cosmika", "real", "Mensagens, fotos e desenhos do cliente"],
    "cos-atd": ["Cosmika", "Atendimento", "build", "Necessidades, cada uma com o trecho da conversa"],
    "atd-pro": ["Atendimento", "Propostas técnicas", "build", "Pedido de orçamento com o desenho e a conversa"],
    "pro-atd": ["Propostas técnicas", "Atendimento", "build", "Revisão emitida, com o PDF e o que mudou"],
    "atd-cos": ["Atendimento", "Cosmika", "build", "Envio aprovado por uma pessoa"],
    "cos-wa": ["Cosmika", "WhatsApp (Meta)", "real", "Mensagem e PDF ao cliente"],
    "pro-ope": ["Propostas técnicas", "Operação e custos", "prop", "Revisão aceita, congelada, sem redigitar"],
    "ope-erp": ["Operação e custos", "Omni, ERP (a confirmar)", "prop", "Pedido e faturamento, quando houver interface"],
    "ope-pcp": ["Operação e custos", "Carga Máquina, PCP", "prop", "Ordem e roteiro, digitados uma vez só"],
    "pcp-ope": ["Carga Máquina, apontamento por tablet", "Operação e custos", "prop", "Apontamentos, para conciliar com a ordem"],
    "lab-ope": ["Laboratório, planilha da massa", "Operação e custos", "prop", "Curva e dureza do lote de borracha"],
    "mail-atd": ["E-mail", "Atendimento", "prop", "Pedidos e desenhos que chegam por e-mail"],
  };

  const flow = (steps, on) => `<div class="flow">${steps.map((s, i) => `<span class="fstep ${i < on ? "done" : i === on ? "now" : ""}">${esc(s)}</span>`).join('<span class="farrow" aria-hidden="true">›</span>')}</div>`;
  const money = (v) => `R$ ${v}`;

  const STEPS = [
    {
      group: C, t: "Contato chega", antes: [["Manual", "O WhatsApp fica no celular de uma pessoa, que responde quando consegue"], ["Sem registro", "Foto e desenho se perdem no meio da conversa"]], depois: [["Agente", "A Cosmika responde na hora, com o que a base de conhecimento diz"], ["Registro", "Foto e desenho ficam guardados no atendimento do cliente"]], kb: ["svc", "cosm"], app: "cosmika", links: ["wa-cos"],
      who: "O agente de IA da Cosmika responde pelo catálogo de serviços e pede o desenho. A foto chega, mas não define medida nem dureza.",
      never: "O agente não promete preço, prazo nem viabilidade. Foto não preenche dimensão, material ou dureza.",
      real: "Atendimento pelo WhatsApp com agente de IA e base de conhecimento: funciona hoje na Cosmika.",
      screen: () => appwin("cosmika", `<div class="box inbox"><div class="conv-list"><div class="conv on"><span class="who">Contato de demonstração</span><span class="last">Segue o desenho. Borracha NBR…</span></div><div class="conv"><span class="who">Contato de demonstração 2</span><span class="last">Qual o prazo da recuperação…</span></div></div>
        <div class="thread"><div class="idline"><span class="badge b-info">Com o agente</span><span>Caixa Comercial · o agente chama a equipe no que não sabe</span></div>
          <div class="kb-hit"><span class="h">${ic.file}A resposta das 08:41 usou o catálogo de serviços</span><span>${KB.svc.item}</span><span class="meta">${KB.svc.where}</span></div>
          <div class="kb-hit"><span class="h">${ic.file}Anexos recebidos</span>${PDF("foto-cilindro.jpg")}${PDF("desenho-cilindro.pdf · 1 página")}<span class="meta">Ficam na conversa e seguem para a inspeção e o orçamento.</span></div></div></div>`),
    },
    {
      group: C, t: "Necessidades", antes: [["Redigitação", "Alguém relê a conversa e copia material, dureza e prazo para a planilha"], ["Busca manual", "Para saber se a peça já veio antes, procura em pastas e planilhas antigas"]], depois: [["Agente", "Cada necessidade é registrada com o trecho da conversa de onde saiu"], ["Automático", "O histórico de peças aponta o desenho já atendido, para uma pessoa conferir"]], kb: ["hist", "mat", "cosm"], app: "cosmika", links: ["cos-atd"], fill: { sel: "#tool li.wait", attr: "data-t" },
      who: "O agente registra cada informação no Atendimento com o trecho exato da conversa e combina o envio das peças.",
      never: "O histórico do desenho não liga as peças ao pedido: a inspeção e uma pessoa confirmam se são as mesmas.",
      real: "Ferramenta externa do agente: existe na Cosmika. A ferramenta registrar_necessidades e a assinatura das chamadas estão em construção.",
      screen: () => appwin("cosmika", `<div class="thread" style="padding:0">
        <div class="kb-hit"><span class="h">${ic.file}Respostas desta etapa usaram</span><span>Histórico de peças · Tabela de compostos e durezas</span><span class="meta">Abra Conhecimento, ao lado, para ver cada item.</span></div>
        <div class="toolcard" id="tool"><span class="h">${ic.sparkle}Necessidades registradas no Atendimento e prospecção</span>
          <ul>${FIELDS.map(([id, l, v]) => `<li class="${fillCls(2)}" data-t="${id}"><span class="k">${l}</span><span>${esc(v)} <q>${esc(quote(id))}</q></span></li>`).join("")}<li class="${fillCls(2)}" data-t=""><span class="k">Anexos</span><span>foto-cilindro.jpg, desenho-cilindro.pdf</span></li></ul>
          <span class="meta">Pela ferramenta registrar_necessidades do agente · chamada assinada · entregue às 08:55</span></div>
        <div class="toolcard"><span class="h">${ic.users}Conversa passada para pessoa</span><span>Equipe Comercial, que recebe as peças e abre a inspeção.</span></div></div>`),
    },
    {
      group: C, t: "Inspeção", antes: [["Planilha", "A ficha é preenchida no Excel, com número dado à mão"], ["Sem registro", "As fotos ficam numa pasta à parte, longe da peça"]], depois: [["Registro", "A ficha nasce no app, numerada, com um código por peça física"], ["Automático", "As fotos ficam ligadas à peça e à ficha"]], kb: ["fichas", "hist"], app: "propostas", act: "Registrar a inspeção", links: ["atd-pro"], fill: { sel: "#insp .r.wait", attr: "data-f" }, toast: "Inspeção registrada; cada peça ganhou o seu código.",
      who: "As peças chegam com a nota de remessa. A inspeção mede, fotografa as avarias e dá a cada peça física o seu código individual, mesmo sendo iguais.",
      never: "O código não é reaproveitado de outra peça por semelhança. Peças iguais têm códigos diferentes.",
      real: "Peça com código próprio e documentos de origem: em construção no Propostas técnicas. Ficha de inspeção nesta forma: proposta, a partir da planilha mostrada em 18/11.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><code>Ficha 2611.031</code><span class="badge ${done ? "b-ok" : "b-pend"}">${done ? "Inspeção registrada" : "Em inspeção"}</span><span>Atendimento ATD-0011 · peças recebidas em 24/11</span></div><h2>Inspeção inicial de 2 cilindros</h2></div>
        <div class="cols"><div class="box"><div class="box-head"><h3>O que a inspeção encontrou</h3><span class="meta">Medido na peça</span></div><div class="rows" id="insp">
          ${row("nf", "Nota de remessa", "NF 4417 de 24/11 (exemplo)", "Caixa de madeira, transportadora do cliente", "", fillCls(3, done))}
          ${row("cod", "Código individual", "EX-0417 e EX-0418", "Um por peça física, mesmo iguais", "", fillCls(3, done))}
          ${row("dim", "Dimensões medidas", "Ø 180 × 450 mm", "Inspeção, peça EX-0417; a EX-0418 confere", "", fillCls(3, done))}
          ${row("dur0", "Dureza da borracha antiga", "68 Shore A", "Durômetro, na inspeção", "", fillCls(3, done))}
          ${row("ava", "Avarias", "Trinca na borda, as duas peças", "3 fotos anexadas à inspeção", "", fillCls(3, done))}
          ${row("nuc", "Núcleo metálico", null, "Só se avalia depois de remover a borracha", pend, fillCls(3, done), "A avaliar")}
          ${row("ret", "Mesmas peças de 03/2026?", "Não: outras peças do mesmo desenho", `${tr("outros cilindros, do mesmo desenho")}. Histórico do desenho ligado; as peças ganham códigos novos.`, ok, fillCls(3, done))}</div></div>
        <div class="box fit"><div class="box-head"><h3>Fotos</h3></div><div class="box-body"><div class="photos">${[["foto-cilindro.jpg","cilindro","Trinca na ponta"],["foto-ponta-eixo.jpg","ponta","Ponta do eixo"],["foto-rolo-trena.jpg","trena","Comprimento"]].map(([f,k,l]) => `<button class="ph-img" data-file="${f}" aria-label="Abrir a foto: ${l}">${Assets.photo(k)}</button>`).join("")}</div><p class="meta">Fotos de exemplo. Servem para mostrar a avaria; medida e dureza saem da inspeção.</p><p class="meta">Tempo de inspeção: 25 min, registrado na ficha.</p></div></div></div>`,
        handoff("Recebido do Atendimento ATD-0011: necessidades com os trechos, desenho e foto.")),
    },
    {
      group: C, t: "Orçamento", antes: [["Redigitação", "As medidas são copiadas da ficha para outra planilha"], ["Busca manual", "R$/kg e a faixa da tabela de tempos são procurados à mão"], ["Planilha", "A margem é aplicada na planilha e o PDF sai dela"]], depois: [["Automático", "Peso, material e mão de obra saem da ficha e das tabelas vigentes, com a conta à vista"], ["Aprovação", "O Comercial decide só preço, prazo e validade, com a origem"]], kb: ["mat", "tempos", "propostas", "fichas"], app: "propostas", act: "Emitir revisão 0", links: ["pro-atd"], toast: "Revisão 0 emitida e enviada ao Atendimento.",
      who: "O custo previsto sai das tabelas da empresa, com a conta à vista. O Comercial decide o preço e o prazo, com a origem.",
      never: "O app só aplica tabela cadastrada e vigente, e não decide preço nem margem.",
      real: "Revisões numeradas e congeladas: em construção. Custo previsto por tabela vigente: proposta, depende das tabelas da empresa.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><code>PRO-0011</code><span class="badge ${done ? "b-info" : "b-pend"}">${done ? "Revisão 0 emitida" : "Minuta incompleta"}</span><span>Peças EX-0417 e EX-0418 · ficha 2611.031</span></div><h2>Custo previsto por peça e proposta</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>Custo previsto, por peça</h3><span class="meta">Tabelas de exemplo, vigentes</span></div><div class="rows">
          ${row("m", "Material", money("238,08"), "Ø e comprimento dão o volume e o peso: 6,20 kg × R$ 38,40/kg · tabela de compostos, NBR 70", ok)}
          ${row("l", "Mão de obra", money("184,80"), "165 min (2,75 h) × R$ 67,20/h · tabela de tempos, faixa Ø 150–200 × comprimento 400–500 mm, inspeção incluída", ok)}
          ${row("t", "Custo previsto", money("422,88"), "Soma dos componentes da tabela. Máquina e rateios ficam fora.", "")}
          ${row("d", "Dureza", "70 ±5 Shore A", "O cliente pediu 70 Shore A; ±5 é a tolerância padrão da tabela de compostos", ok)}</div></div>
        <div class="box fit"><div class="box-head"><h3>Condições comerciais</h3><span class="meta">Digitadas pelo Comercial</span></div><div class="rows">
          ${row("p", "Preço por peça", done ? money("690,00") : null, done ? "Custo previsto mais a margem do Comercial · valor de exemplo · Rafael" : "A digitar por quem tem o papel Comercial", done ? ok : pend, "", "Pendente")}
          ${row("z", "Prazo de entrega", done ? "15 dias úteis após o pedido" : null, done ? "Consulta ao PCP em 25/11 · Rafael, Comercial" : "A digitar por quem tem o papel Comercial", done ? ok : pend, "", "Pendente")}
          ${row("v", "Validade", done ? "10 dias" : null, done ? "Política comercial de exemplo" : "A digitar", done ? ok : pend, "", "Pendente")}</div></div></div>`),
    },
    {
      group: C, t: "Envio", antes: [["Manual", "O PDF vai por e-mail ou WhatsApp, por quem lembrar de mandar"], ["Sem registro", "Não fica claro qual versão o cliente recebeu"]], depois: [["Aprovação", "Uma pessoa aprova o texto final e o PDF"], ["Registro", "A revisão enviada fica congelada; a janela de 24 h do WhatsApp é respeitada"]], kb: ["cosm", "propostas"], app: "atendimento", act: "Aprovar e enviar", links: ["atd-cos", "cos-wa"], toast: "Aprovado e enviado pela Cosmika.",
      who: "A revisão 0 volta ao Atendimento. Uma pessoa lê o texto final e o PDF e aprova o envio.",
      never: "Nada sai sem aprovação. Fora da janela de 24 horas, só por template aprovado na Meta.",
      real: "Envio de texto e PDF existe na Cosmika; o acesso por chave e a conferência da janela estão em construção.",
      screen: (done) => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0011</code><span>Revisão 0 do PRO-0011 recebida às 10:02</span></div><h2>${done ? "Enviada ao cliente às 10:20" : "Enviar a revisão 0 ao cliente?"}</h2></div>
        <div class="box fit"><div class="box-body">
          <span class="window out">${ic.clock}Fora da janela de 24 horas: vai pelo template de proposta, aprovado na Meta, com o PDF.</span>
          <div><p class="meta" style="margin-bottom:4px">Texto que o cliente vai receber</p><div class="final">Segue a proposta de revestimento dos dois cilindros (EX-0417 e EX-0418). Fico à disposição.</div></div>
          <div>${PDF("Proposta PRO-0011 rev. 0.pdf · 2 páginas")}</div>
          <p class="meta">${done ? "Aprovado por Rafael · Comercial às 10:20. Entregue às 10:20." : "A aprovação fica registrada com o seu nome e o papel."}</p></div></div>`,
        handoff("Recebido do Propostas técnicas: revisão 0 emitida, com o PDF.")),
    },
    {
      group: C, t: "Revisão 1", antes: [["Planilha", "A planilha é copiada ou sobrescrita"], ["Sem registro", "O que mudou entre as versões fica na memória de quem fez"]], depois: [["Registro", "A revisão 1 mostra o antes e o depois de cada campo"], ["Aprovação", "O envio passa de novo por uma pessoa"]], kb: ["propostas"], app: "propostas", act: "Aprovar envio (no Atendimento)", links: ["wa-cos", "cos-atd", "atd-pro", "pro-atd"], toast: "Revisão 1 aprovada e enviada.",
      who: "O pedido de tolerância menor vira alteração. O responsável técnico decide, o tempo de controle sobe pela tabela e o Comercial ajusta o preço.",
      never: "A revisão 0 continua guardada. Ninguém compara PDFs nem procura no WhatsApp o que mudou.",
      real: "Em construção no Propostas técnicas.",
      screen: (done) => appwin("propostas", `<div class="screen-title"><div class="idline"><code>PRO-0011</code><span class="badge b-info">Revisão 1 emitida</span><span>${done ? "Envio aprovado no Atendimento às 16:30" : "Emitida às 16:05; o envio é aprovado no Atendimento"}</span></div><h2>O que mudou da revisão 0 para a 1</h2></div>
        <div class="box fit"><div class="rows"><table class="difft"><thead><tr><th>Campo</th><th>Rev. 0</th><th>Rev. 1</th><th>Por quê</th><th>Evidência</th></tr></thead><tbody>
          <tr><td>Dureza</td><td class="v" data-l="Rev. 0"><s>70 ±5 Shore A</s></td><td class="v" data-l="Rev. 1">70 ±2 Shore A</td><td data-l="Por quê">Pedido do cliente (decisão do ${TEC})</td><td data-l="Evidência"><q>tolerância de ±2 Shore A</q>, WhatsApp 25/11 14:02</td></tr>
          <tr><td>Mão de obra</td><td class="v" data-l="Rev. 0"><s>2,75 h</s></td><td class="v" data-l="Rev. 1">3,00 h</td><td data-l="Por quê">Controle de dureza mais longo na inspeção final (+0,25 h)</td><td data-l="Evidência">Tabela de tempos de exemplo, controle ±2</td></tr>
          <tr><td>Custo previsto</td><td class="v" data-l="Rev. 0"><s>R$ 422,88</s></td><td class="v" data-l="Rev. 1">R$ 439,68</td><td data-l="Por quê">Consequência da mão de obra</td><td data-l="Evidência">Mesmas tabelas vigentes</td></tr>
          <tr><td>Preço por peça</td><td class="v" data-l="Rev. 0"><s>R$ 690,00</s></td><td class="v" data-l="Rev. 1">R$ 720,00</td><td data-l="Por quê">Decisão do Comercial (Rafael)</td><td data-l="Evidência">Valor de exemplo, digitado</td></tr></tbody></table></div></div>
        <p class="note">${ic.info}<span>Material, dimensões, cor e prazo ficaram iguais à revisão 0.</span></p>`,
        handoff("Recebido do Atendimento: pedido de alteração com o trecho da conversa de 25/11.")),
    },
    {
      group: C, t: "Pedido", antes: [["Manual", "O pedido de compra é conferido de olho contra a proposta"], ["Retrabalho", "Uma divergência de data descoberta tarde vira retrabalho"]], depois: [["Automático", "O app compara pedido e revisão campo a campo"], ["Aprovação", "Divergência trava o fechamento até alguém decidir"]], kb: ["propostas", "cosm"], app: "atendimento", act: "Registrar e fechar o pedido", links: ["wa-cos", "cos-atd", "mail-atd"], toast: "Pedido fechado; a revisão 1 segue congelada para a operação.",
      who: "Uma pessoa registra o pedido com a evidência e a revisão aceita. O app confere pedido contra revisão; a divergência é decidida antes de fechar.",
      never: "Aceite não é deduzido da conversa. Um pedido com divergência não fecha sozinho.",
      real: "Em construção no Atendimento e prospecção.",
      screen: (done) => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>ATD-0011</code><span class="badge ${done ? "b-ok" : ""}">${done ? "Pedido fechado" : "Pedido a registrar"}</span></div><h2>Pedido de compra 8812 (exemplo) contra a revisão 1</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>Evidência do aceite</h3></div><div class="box-body"><p><q>Aprovado. Segue o pedido de compra.</q></p>${PDF("Pedido de compra 8812.pdf")}<p class="meta">WhatsApp, 26/11/2026 09:15. Revisão aceita: PRO-0011 rev. 1.</p></div></div>
        <div class="box fit"><div class="box-head"><h3>Pedido × revisão 1</h3></div><div class="rows">
          <div class="r"><span class="l">Quantidade</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Igual</span><span class="v">2 = 2 peças</span></div>
          <div class="r"><span class="l">Preço por peça</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Igual</span><span class="v">R$ 720,00 = R$ 720,00</span></div>
          <div class="r"><span class="l">Dureza</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Igual</span><span class="v">70 ±2 Shore A</span></div>
          <div class="r"><span class="l">Entrega</span><span class="chk bad" style="grid-column:2;grid-row:1/span 2">${ic.help}Diverge</span><span class="v">11/12 no pedido, 17/12 pela revisão</span><span class="s">${done ? `Decidido: 17/12 (Rafael · Comercial). ${tr("Pode ser 17/12.")}, WhatsApp 26/11 09:41` : "O cliente respondeu; registrar a decisão antes de fechar."}</span></div></div></div></div>`),
    },
    {
      group: O, t: "Ordem", antes: [["Redigitação", "Os dados aprovados são digitados no Omni"], ["Redigitação", "E digitados de novo no Carga Máquina"]], depois: [["Automático", "A ordem nasce da revisão aceita, uma vez só, e segue para os dois sistemas"], ["Aprovação", "O PCP confere e libera"]], kb: ["omni", "carga"], app: "operacao", st: "prop", chat: "min", act: "Liberar a ordem", links: ["pro-ope", "ope-erp", "ope-pcp"], toast: "Ordem SIM-OS-A liberada a partir da revisão aceita.",
      who: "A ordem nasce da revisão aceita, uma vez só, e segue para o Omni e para o Carga Máquina. Quem libera é o PCP.",
      never: "Ninguém digita os mesmos dados duas vezes. O Omni e o Carga Máquina continuam sendo os sistemas da empresa.",
      real: "Proposta. Hoje os dados aprovados são digitados à mão nos dois sistemas. Depende das interfaces do Omni e do Carga Máquina.",
      screen: (done) => appwin("operacao", `<div class="screen-title"><div class="idline"><code>SIM-OS-A</code><span class="badge ${done ? "b-ok" : "b-info"}">${done ? "Liberada" : "A liberar"}</span><span>Serviço SIM-SERV-A · pedido 8812 · PRO-0011 rev. 1</span></div><h2>Ordem de serviço a partir da revisão aceita</h2></div>
        <div class="cols"><div class="box"><div class="box-head"><h3>O que a ordem leva</h3><span class="meta">Congelado da revisão 1</span></div><div class="rows">
          ${row("a", "Peças", "EX-0417 e EX-0418", "Códigos individuais da inspeção", "")}
          ${row("b", "Serviço", "Revestimento, NBR 70 ±2 Shore A", "Revisão 1", "")}
          ${row("c", "Dimensões", "Ø 180 × 450 mm", "Ficha de inspeção 2611.031", "")}
          ${row("d", "Tempo previsto", "3,00 h por peça", "Tabela de tempos de exemplo", "")}
          ${row("e", "Material previsto", "6,20 kg de NBR 70 por peça", "Tabela de compostos de exemplo", "")}
          ${row("f", "Entrega", "17/12/2026", "Combinada com o cliente em 26/11", "")}
          ${row("g", "Núcleo metálico", null, "Avaliado na remoção da borracha", pend, "", "A avaliar")}</div></div>
        <div class="box fit"><div class="box-head"><h3>Para onde vai</h3></div><div class="box-body">
          <div class="r" style="padding:6px 0;border:0"><span class="l">Omni, ERP (nome a confirmar)</span>${stBadge("prop")}<span class="v">Pedido no kanban, até o faturamento</span><span class="s">Hoje: digitado à mão depois do aceite</span></div>
          <div class="r" style="padding:6px 0;border:0"><span class="l">Carga Máquina, PCP</span>${stBadge("prop")}<span class="v">Ordem, roteiro e tempos previstos</span><span class="s">Hoje: digitado de novo, à mão</span></div>
          <p class="meta">${done ? `Liberada por ${PCPP} em 26/11 10:40.` : "Uma pessoa do PCP confere e libera."}</p></div></div></div>`,
        handoff("Recebido do Atendimento e do Propostas técnicas: pedido 8812 fechado e revisão 1 congelada.")),
    },
    {
      group: O, t: "Programação", antes: [["Planilha", "A massa corre em planilha, o núcleo no Carga Máquina"], ["Busca manual", "Saber onde está cada peça exige perguntar na fábrica"]], depois: [["Automático", "Os dois caminhos aparecem lado a lado, lidos do PCP e do laboratório"]], kb: ["carga"], app: "operacao", st: "prop", chat: "min", links: ["ope-pcp", "lab-ope"],
      who: "O PCP programa dois caminhos que se encontram no revestimento: o núcleo metálico e a borracha, que passa pelo laboratório.",
      never: "Esta tela lê a programação do PCP; quem programa continua sendo o PCP.",
      real: "Proposta. Roteiro como a operação explicou em 18/11; tempos e datas são de exemplo.",
      screen: () => appwin("operacao", `<div class="screen-title"><div class="idline"><code>SIM-OS-A</code><span class="badge b-info">Programada</span><span>Roteiro de 18/11, a conferir</span></div><h2>Dois caminhos até o revestimento</h2></div>
        <div class="box fit"><div class="box-head"><h3>Núcleo metálico</h3><span class="meta">Peças EX-0417 e EX-0418</span></div><div class="box-body">${flow(["Remoção da borracha", "Usinagem", "Limpeza", "Adesivagem", "Aguarda revestimento"], 2)}<p class="meta">Núcleo avaliado na remoção: sem empeno nas duas peças (${PCPP}).</p></div></div>
        <div class="box fit"><div class="box-head"><h3>Borracha</h3><span class="meta">Lote de NBR 70</span></div><div class="box-body">${flow(["Pesagem", "Homogeneização", "Laboratório: curva e dureza", "Semiacabado"], 2)}<p class="meta">O laboratório libera o lote; a dureza medida volta para a ordem. Hoje a massa corre em planilha e o Carga Máquina acompanha a peça.</p></div></div>
        <div class="box fit"><div class="box-head"><h3>Depois do encontro</h3></div><div class="box-body">${flow(["Revestimento em camadas", "Enfaixamento", "Autoclave", "Desbaste", "Retífica", "Inspeção final"], -1)}</div></div>`),
    },
    {
      group: O, t: "Apontamentos", antes: [["Sem registro", "Apontamento sem ordem clara fica esquecido ou entra na ordem errada"]], depois: [["Aprovação", "O evento ambíguo fica separado até alguém conferir ordem e duplicidade"]], kb: ["carga"], app: "operacao", st: "prop", chat: "min", act: "Conferir e vincular o evento", links: ["pcp-ope"], toast: "Evento SIM-EVT-C vinculado à ordem depois da conferência.",
      who: "Os apontamentos do tablet chegam do PCP. Um evento sem ordem clara fica separado até alguém conferir a ordem e que não está duplicado.",
      never: "Evento sem vínculo não entra no custo. Vincular não encerra a etapa sozinho.",
      real: "Proposta. Depende de exportação ou interface do PCP.",
      screen: (done) => appwin("operacao", `<div class="screen-title"><div class="idline"><code>SIM-OS-A</code><span class="badge ${done ? "b-ok" : "b-pend"}">${done ? "Sem divergência" : "1 divergência"}</span><span>Apontamentos por tablet, vindos do PCP</span></div><h2>O realizado acompanha a ordem</h2></div>
        <div class="box fit"><div class="rows">
          <div class="r"><span class="l">SIM-EVT-A · Usinagem · 26/11</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Vinculado</span><span class="v">1,50 h</span><span class="s">Ordem SIM-OS-A no próprio apontamento</span></div>
          <div class="r"><span class="l">SIM-EVT-B · Revestimento · 02/12</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Vinculado</span><span class="v">1,25 h</span><span class="s">Ordem SIM-OS-A no próprio apontamento</span></div>
          <div class="r"><span class="l">SIM-EVT-C · Revestimento, complemento · 03/12</span><span class="chk ${done ? "ok" : "bad"}" style="grid-column:2;grid-row:1/span 2">${done ? ic.check + "Vinculado" : ic.help + "Sem vínculo"}</span><span class="v">0,65 h</span><span class="s">${done ? `Conferido por ${PCPP}: mesma ordem, sem duplicidade.` : "O tablet registrou sem ordem. Conferir a ordem e se não duplica o SIM-EVT-B."}</span></div>
          <div class="r"><span class="l">SIM-CONS-A · Consumo de NBR 70</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Vinculado</span><span class="v">6,20 kg</span><span class="s">Baixa do lote na ordem</span></div></div></div>
        <p class="note">${ic.info}<span>Tempos e consumos de exemplo, por peça. A etapa de inspeção final ainda não tem apontamento.</span></p>`),
    },
    {
      group: O, t: "Custo", antes: [["Planilha", "Custo real só aparece se alguém cruzar planilhas, e quase nunca acontece"]], depois: [["Automático", "Previsto e realizado por ordem, no mesmo componente"], ["Registro", "O que ainda falta apurar fica à vista; o subtotal não vira custo total"]], kb: ["carga", "tempos"], app: "operacao", st: "prop", chat: "min", links: ["ope-erp"],
      who: "Serviço, ordem, apontamentos e consumo conciliados mostram o custo realizado até aqui, ao lado do previsto na revisão aceita. Só entra no custo o que foi conferido.",
      never: "Custo com componente faltando aparece como parcial. Só se compara o mesmo componente, sem percentual inventado.",
      real: "Proposta. O custo completo depende das regras de custeio e dos rateios da empresa.",
      screen: () => {
        const linked = isActed(10);
        const lab = linked ? "3,40 h · R$ 228,48" : "2,75 h · R$ 184,80";
        const total = linked ? "R$ 466,56" : "R$ 422,88";
        const over = linked ? "0,65 h acima do previsto" : "Igual ao previsto, por enquanto";
        return appwin("operacao", `<div class="screen-title"><div class="idline"><code>SIM-SERV-A</code><span class="badge b-pend">Custo parcial</span><span>Ordem SIM-OS-A · por peça</span></div><h2>Previsto na revisão 1 e realizado até agora</h2></div>
        <div class="box fit"><div class="rows"><table class="difft"><thead><tr><th>Componente</th><th>Previsto</th><th>Realizado</th><th>Origem</th></tr></thead><tbody>
          <tr><td>Material</td><td class="v" data-l="Previsto">6,20 kg · R$ 238,08</td><td class="v" data-l="Realizado">6,20 kg · R$ 238,08</td><td data-l="Origem">SIM-CONS-A, tabela de compostos vigente</td></tr>
          <tr><td>Mão de obra de produção</td><td class="v" data-l="Previsto">2,75 h · R$ 184,80</td><td class="v" data-l="Realizado">${lab}</td><td data-l="Origem">${linked ? "SIM-EVT-A, B e C" : "SIM-EVT-A e B; o SIM-EVT-C fica fora até a conferência"}, tarifa de exemplo sem máquina e rateios</td></tr>
          <tr><td>Inspeção final</td><td class="v" data-l="Previsto">0,25 h · R$ 16,80</td><td class="v" data-l="Realizado">a apurar</td><td data-l="Origem">Sem apontamento ainda</td></tr>
          <tr><td>Máquina e rateios</td><td class="v" data-l="Previsto">fora da tabela</td><td class="v" data-l="Realizado">a apurar</td><td data-l="Origem">Regra de custeio a definir com a empresa</td></tr></tbody></table></div></div>
        <div class="cols fitrow"><div class="box fit"><div class="box-body"><p class="meta">Realizado conhecido</p><p class="v" style="font-size:1.25rem;font-weight:600">${total} por peça</p><p class="meta">Parcial: faltam inspeção final, máquina e rateios.</p></div></div>
        <div class="box fit"><div class="box-body"><p class="meta">Mão de obra de produção</p><p class="v" style="font-size:1.25rem;font-weight:600">${over}</p><p class="meta">Mesmo componente e mesma ordem, sem a inspeção final. Motivo a registrar pelo PCP.</p></div></div></div>`);
      },
    },
    {
      group: O, t: "Entrega", antes: [["Manual", "Alguém lembra de avisar o cliente e de mandar o guia"]], depois: [["Aprovação", "Aviso com o dia da rota e o guia, aprovado por uma pessoa"], ["Agente", "O agente responde depois as dúvidas de uso com o guia"]], kb: ["rota", "guia"], app: "atendimento", act: "Aprovar o aviso de entrega", links: ["atd-cos", "cos-wa", "ope-erp"], toast: "Aviso aprovado e enviado pela Cosmika.",
      who: "A inspeção final confere dureza e acabamento. O Atendimento avisa o cliente do dia da entrega, com o guia de uso, depois da aprovação de uma pessoa.",
      never: "Peça fora da tolerância não é liberada. O aviso não sai sem aprovação.",
      real: "Aviso pela Cosmika: em construção. Inspeção final e nota de saída no Omni: proposta.",
      screen: (done) => appwin("atendimento", `<div class="screen-title"><div class="idline"><code>SIM-OS-A</code><span class="badge b-ok">Inspeção final aprovada</span><span>Peças EX-0417 e EX-0418</span></div><h2>${done ? "Cliente avisado às 07:30" : "Avisar o cliente da entrega?"}</h2></div>
        <div class="cols"><div class="box fit"><div class="box-head"><h3>Inspeção final</h3></div><div class="rows">
          <div class="r"><span class="l">Dureza medida</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Dentro</span><span class="v">71 e 69 Shore A</span><span class="s">Especificado: 70 ±2 Shore A</span></div>
          <div class="r"><span class="l">Dimensões</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Dentro</span><span class="v">Ø 180 × 450 mm</span><span class="s">Tolerâncias do desenho</span></div>
          <div class="r"><span class="l">Concentricidade</span><span class="chk ok" style="grid-column:2;grid-row:1/span 2">${ic.check}Dentro</span><span class="v">Até 0,02 mm</span><span class="s">Medida nos colos de rolamento</span></div></div></div>
        <div class="box fit"><div class="box-body">
          <div><p class="meta" style="margin-bottom:4px">Texto que o cliente vai receber</p><div class="final">Os dois cilindros estão prontos e saem hoje na rota da região de vocês. Segue o guia de uso e armazenamento.</div></div>
          ${PDF("Guia de uso e armazenamento.pdf")}
          <p class="meta">Entrega na quinta, 17/12, na rota fixa daquela região. O dia vai no aviso; o horário não.</p></div></div></div>`,
        handoff("Recebido do Operação e custos: inspeção final aprovada nas duas peças.")),
    },
    {
      group: "Proposta", t: "Nossa proposta", app: "resto", chat: "min", links: [],
      who: "A Resto hospeda os apps no servidor da empresa. O agente da Resto faz as mudanças que a empresa pedir, e a empresa aprova cada uma.",
      never: "Nenhuma mudança vai para produção sem aprovação da empresa. Os dados não saem do servidor dela.",
      real: "Plataforma, catálogo, servidor por organização e agentes: funcionam hoje. Os três apps: em construção, em código aberto.",
      screen: () => appwin("resto", `<div class="screen-title"><div class="idline"><span class="badge b-info">Proposta</span><span>Para a Sanborr e qualquer indústria da FIESP</span></div><h2>O app é aberto e gratuito. O que se paga é a plataforma.</h2></div>
        <div class="cols quad">
          <div class="box fit"><div class="box-head"><h3>1. Apps de código aberto</h3><span class="meta">Sem licença</span></div><div class="box-body"><ul class="plain">
            <li><strong>Atendimento e prospecção</strong>: conversas, clientes, pedidos</li>
            <li><strong>Propostas técnicas</strong>: inspeção, desenho, orçamento e revisões</li>
            <li><strong>Operação e custos</strong>: ordem, apontamentos e custo</li></ul>
            <p class="meta">Qualquer indústria da FIESP pode usar e adaptar, sem pagar pelo software.</p></div></div>
          <div class="box fit"><div class="box-head"><h3>2. Onde roda e quem controla</h3></div><div class="box-body"><ul class="plain">
            <li>Na nuvem que a empresa escolher, ou hospedado pela Resto</li>
            <li>Servidor e banco só da empresa, com opção de VPN e backups diários</li>
            <li>O agente da Resto faz campos, fluxos e integrações quando a empresa pedir; cada mudança passa por testes e aprovação</li></ul>
            <p class="meta">Código e dados são da empresa. Se sair, leva os dois.</p></div></div>
          <div class="box fit price"><div class="box-head"><h3>3. O preço é o da plataforma</h3></div><div class="box-body">
            <p class="v">Plano Scale · R$ 950/mês</p>
            <ul class="plain"><li>Servidor só da empresa: 4 vCPU, 8 GB de memória, 80 GB de disco</li><li>Até 10 apps do catálogo, incluindo a Cosmika</li><li>120 horas de agentes por mês para as mudanças, 15 pessoas</li></ul>
            <p class="meta">Preço no Pix, da página de planos do Resto em 18/11/2026. Acima disso: sob consulta, a partir de R$ 2.990/mês.</p></div></div>
          <div class="box fit"><div class="box-head"><h3>4. Prazo e custos de terceiros</h3><span class="meta">Estimativas da call de 18/11</span></div><div class="box-body">
            <p><strong>Três semanas</strong> para a primeira versão, contadas a partir de recebermos o catálogo de preços, a planilha de precificação, as regras de atendimento e a base de conhecimento.</p>
            <ul class="plain"><li>WhatsApp (Meta): de R$ 100 a R$ 200 por mês</li><li>IA: de R$ 70 a R$ 100 por mês; um pedido com análise de foto, de R$ 0,50 a R$ 0,70</li></ul>
            <p class="meta">Estimativas sem medição de uso. O piloto mede os valores reais antes de qualquer compromisso.</p></div></div>
        </div>
        <p class="note">${ic.info}<span>O Omni e o Carga Máquina continuam sendo os sistemas da empresa. Os apps se ligam a eles; não os substituem.</span></p>`),
    },
  ];

  Journey.start({ FILES: SanborrCommon.FILES, PLATFORM: SanborrCommon.PLATFORM, FAQ: SanborrCommon.FAQ, scenarios: SanborrCommon.SCENARIOS, scenario: "desenho", menu: true, compare: true, contact: "Indústria de demonstração", contactInitials: "ID", contactSub: "Com desenho · WhatsApp na Cosmika", compareSummary: "Hoje os mesmos dados passam por quatro lugares: a ficha de inspeção, a planilha de orçamento, o Omni e o Carga Máquina, cada um digitado à mão. Com o Resto, são registrados uma vez, na inspeção, e seguem para os outros.", key: "pcs2", org: ORG, title: "Percurso Sanborr", sub: "Conversa 1 de 3 · cliente com desenho · D3 e D2", pageTitle: "Percurso Sanborr: do WhatsApp à entrega", KB, CHAT, LINKS, STEPS });
})();
