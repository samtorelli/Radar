// ---------------------------------------------------------------------------
// data.js — CAMADA DE DADOS ÚNICA (mock).
// Fonte única da verdade para todas as telas. Dados fictícios porém coerentes.
// Preparado para substituição futura por API: exporte as mesmas estruturas
// a partir de fetch() sem alterar as telas.
//
// Cenário demonstrado:
//   6 pessoas · 4 em atendimento · 1 em pausa · 2 gaps de cobertura
//   gap crítico 14:00–15:00 no Chat · 1 ausência sem contato
//   1 troca de turno aguardando confirmação · 2 pendências de validação do DIM
// ---------------------------------------------------------------------------

// Códigos da timeline. Cada pessoa tem 24 chars (intervalos de 30 min),
// colapsados para 12 horas na exibição (08:00–20:00).
export const CODE = { a: "at", c: "co", p: "pa", f: "fo", t: "tk", v: "fe", x: "au", "?": "pe" };

export const TIMELINE = {
  at: { label: "Em atendimento", bg: "#8D0DE3", border: "#8D0DE3", fg: "#fff" },
  co: { label: "Cobertura", bg: "#B6C3FB", border: "#B6C3FB", fg: "#2940A8" },
  pa: { label: "Pausa", bg: "#F0C26C", border: "#F0C26C", fg: "#8C5A0E" },
  fo: { label: "Fora da operação", bg: "#EDEAE1", border: "#E3DFD4", fg: "#7C7A72" },
  tk: { label: "Take", bg: "#85D1BD", border: "#85D1BD", fg: "#1E3F10" },
  fe: { label: "Férias", bg: "#E5D8BD", border: "#E5D8BD", fg: "#8C5A0E" },
  au: { label: "Ausência", bg: "#F49E9E", border: "#F49E9E", fg: "#560F18" },
  pe: { label: "Pendente", bg: "#ECDFFF", border: "#CBA5FD", fg: "#4E0683" },
};

export const HEATMAP = ["#F6F3EC", "#F1EAFB", "#DCC2FF", "#B27BFB", "#8D0DE3", "#4E0683"];

// Pessoas: nome, cluster, líder, escala, entrada, pausa, timeline(24), comentário
export const PEOPLE = [
  { nome: "Amanda Rios", cluster: "Chat", lider: "Renata Alves", escala: "08:00–17:00", entrada: "08:00", pausa: "12:30", tl: "aaaaaaaappaaaaaaaaffffff", comentario: "" },
  { nome: "Carla Nunes", cluster: "Chat", lider: "Renata Alves", escala: "08:00–17:00", entrada: "08:00", pausa: "10:00", tl: "aaaappaaaaaaccaaaaffffff", comentario: "Cobriu Backoffice 14h" },
  { nome: "Heitor Campos", cluster: "Chat", lider: "Renata Alves", escala: "08:00–17:00", entrada: "08:00", pausa: "11:30", tl: "aaaaaappaa??aaaaffffffff", comentario: "Troca pendente" },
  { nome: "Nina Rocha", cluster: "Chat", lider: "Renata Alves", escala: "11:00–20:00", entrada: "11:00", pausa: "15:30", tl: "ffffffaaaaaaaappaaaaaaaa", comentario: "" },
  { nome: "Diego Matos", cluster: "Backoffice", lider: "Marcos Lima", escala: "10:00–19:00", entrada: "10:00", pausa: "14:00", tl: "ffffaaaaaaaappaaaaaaaaff", comentario: "" },
  { nome: "Isabel Duarte", cluster: "Backoffice", lider: "Marcos Lima", escala: "08:00–17:00", entrada: "—", pausa: "—", tl: "xxxxxxxxffffffffffffffff", comentario: "Sem aviso prévio" },
];

// Sugestões de cobertura para o gap 14:00–15:00 (Chat).
export const SUGESTOES = [
  { nome: "Nina Rocha", cluster: "Chat", horario: "11:00–20:00", compat: "Alta", tone: "#3E7A23", soft: "#EAF5DF", conflito: "Sem conflitos no intervalo", conflitoTone: "#3E7A23", custo: "Entra 1 hora antes do previsto na escala dela", custoTone: "#5A5852" },
  { nome: "Carla Nunes", cluster: "Chat", horario: "08:00–17:00", compat: "Média", tone: "#8C5A0E", soft: "#FBEFD0", conflito: "Pausa prevista às 14:00 — precisa ser deslocada", conflitoTone: "#8C5A0E", custo: "Pausa dela passa para 15:00", custoTone: "#8C5A0E" },
  { nome: "Diego Matos", cluster: "Backoffice", horario: "10:00–19:00", compat: "Baixa", tone: "#A8202A", soft: "#FDE7E7", conflito: "Deixa o Backoffice com uma pessoa só", conflitoTone: "#A8202A", custo: "Backoffice fica abaixo do mínimo na mesma hora", custoTone: "#A8202A" },
];

// KPIs da tela Hoje. `to` = rota de destino ao clicar.
export const KPIS = [
  { label: "Pessoas previstas", value: 6, dot: "#8D0DE3", color: "#221C26", hint: "4 no Chat, 2 no Backoffice", to: "dim" },
  { label: "Em atendimento", value: 4, dot: "#6FB344", color: "#221C26", hint: "de 6 pessoas previstas", to: "dim" },
  { label: "Em pausa", value: 1, dot: "#F0C26C", color: "#221C26", hint: "Dentro da janela planejada", to: "dim" },
  { label: "Gaps de cobertura", value: 2, dot: "#A8202A", color: "#A8202A", hint: "14:00–15:00 e 19:00–20:00", to: "cobertura" },
  { label: "Pendências de validação", value: 2, dot: "#6680F3", color: "#221C26", hint: "Aguardando fechamento do DIM", to: "dim" },
];

// Cobertura agregada por slot (12 intervalos de 1 h). Mínimo recomendado: 4/h.
export const COVERAGE_BASE = [4, 5, 6, 6, 5, 4, 3, 5, 6, 5, 4, 2];
export const COVERAGE_MIN = 4;
export const NOW_SLOT = 1; // 09:00–10:00 (hora atual do cenário: 09:42)
export const NOW_LABEL = "09:42";

// Riscos nas próximas 2 horas. `action` resolvido no controller.
export const RISCOS = [
  { time: "12:00", label: "Duas pausas na mesma hora", delta: "−2 de 6", detalhe: "Amanda e Diego param juntos", tone: "#8C5A0E", soft: "#FBEFD0", action: "cobertura" },
  { time: "14:00", label: "Gap confirmado no Chat", delta: "−1 abaixo do mínimo", detalhe: "Nenhuma cobertura alocada até agora", tone: "#A8202A", soft: "#FDE7E7", action: "sugestoes" },
  { time: "17:00", label: "Fim de escala de 3 pessoas", delta: "−3 de 6", detalhe: "Sobram Nina e Diego até as 19:00", tone: "#2940A8", soft: "#E6ECFE", action: "cobertura" },
];

export const ADERENCIA = [
  { cluster: "Chat", prev: 4, real: 4, pct: 100, tone: "#3E7A23" },
  { cluster: "Backoffice", prev: 2, real: 1, pct: 50, tone: "#A8202A" },
];

// Pontos de atenção (tela Hoje). glyph, severidade, horário, título, descrição, ação.
export const ALERTS = [
  { sev: "Alta", tone: "#A8202A", soft: "#FDE7E7", glyph: "!", time: "14:00", title: "Gap de cobertura entre 14h e 15h", desc: "Chat fica com 2 pessoas e o mínimo da hora é 3.", action: "Resolver" },
  { sev: "Média", tone: "#8C5A0E", soft: "#FBEFD0", glyph: "•", time: "09:10", title: "2 DIMs ainda aguardam validação", desc: "Renata e Marcos precisam confirmar as alterações de ontem.", action: "Ver detalhes" },
  { sev: "Média", tone: "#8C5A0E", soft: "#FBEFD0", glyph: "•", time: "11:30", title: "Uma troca de turno precisa de confirmação", desc: "Heitor Campos pediu troca com Nina Rocha para quinta.", action: "Ver detalhes" },
  { sev: "Baixa", tone: "#2940A8", soft: "#E6ECFE", glyph: "i", time: "08:40", title: "Uma pessoa está sem alocação definida", desc: "Heitor Campos ainda não tem frente atribuída depois da pausa.", action: "Resolver" },
];

export const MOVES = [
  { time: "10:00", title: "Próxima pausa relevante", desc: "Carla entra em pausa, Chat fica com 3" },
  { time: "13:00", title: "Próxima troca de cobertura", desc: "Diego assume o Chat por uma hora" },
  { time: "14:00", title: "Próximo horário crítico", desc: "Hora abaixo da cobertura mínima" },
  { time: "17:00", title: "Próxima validação pendente", desc: "Fechamento do DIM do turno da manhã" },
];

// Heatmap de cobertura por frente (Cobertura).
export const HEAT_ROWS = [
  { label: "Chat", carga: [2, 3, 4, 4, 3, 3, 1, 3, 4, 3, 2, 1] },
  { label: "Backoffice", carga: [1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 0] },
];

export const CRITICOS = [
  { range: "14:00 – 15:00", desc: "Chat com 2 pessoas, mínimo é 3", tone: "#A8202A", action: "Cobrir" },
  { range: "19:00 – 20:00", desc: "Só Nina em operação", tone: "#A8202A", action: "Cobrir" },
  { range: "12:00 – 13:00", desc: "Duas pausas na mesma hora", tone: "#D89322", action: "Revisar" },
  { range: "08:00 – 09:00", desc: "Entrada escalonada, aquecimento normal", tone: "#6FB344", action: "Acompanhar" },
];

export const MIN_TABLE = [
  { cluster: "Chat", manha: 3, almoco: 4, tarde: 3, noite: 2 },
  { cluster: "Backoffice", manha: 1, almoco: 2, tarde: 1, noite: 1 },
];

// Ocorrências por coluna (Abertas / Em andamento / Resolvidas).
export const OCORRENCIAS = [
  {
    title: "Abertas", tone: "#A8202A", items: [
      { tipo: "Ausência", tone: "#A8202A", soft: "#FDE7E7", pessoa: "Isabel Duarte", hora: "08:00", desc: "Não iniciou o turno e não respondeu aos contatos.", responsavel: "Marcos Lima", update: "há 12 min", semResposta: "Sem resposta há 12 min" },
      { tipo: "Falha de sistema", tone: "#A8202A", soft: "#FDE7E7", pessoa: "Fila de chat", hora: "09:15", desc: "Fila ficou sem distribuição por 8 minutos.", responsavel: "Renata Alves", update: "há 30 min" },
      { tipo: "Troca de turno", tone: "#8C5A0E", soft: "#FBEFD0", pessoa: "Heitor Campos", hora: "11:30", desc: "Troca com Nina Rocha aguardando confirmação.", responsavel: "Renata Alves", update: "há 1 h" },
    ],
  },
  {
    title: "Em andamento", tone: "#D89322", items: [
      { tipo: "Atraso", tone: "#8C5A0E", soft: "#FBEFD0", pessoa: "Amanda Rios", hora: "09:12", desc: "Entrou 12 minutos depois do previsto, já em atendimento.", responsavel: "Renata Alves", update: "há 2 h" },
      { tipo: "Escalonamento", tone: "#2940A8", soft: "#E6ECFE", pessoa: "Diego Matos", hora: "10:05", desc: "Caso de maquininha sem leitura encaminhado ao time técnico.", responsavel: "Marcos Lima", update: "há 40 min" },
    ],
  },
  {
    title: "Resolvidas", tone: "#6FB344", items: [
      { tipo: "Atraso", tone: "#3E7A23", soft: "#EAF5DF", pessoa: "Carla Nunes", hora: "08:20", desc: "Atraso justificado, pausa remanejada para 10:00.", responsavel: "Renata Alves", update: "há 3 h" },
      { tipo: "Falha de sistema", tone: "#3E7A23", soft: "#EAF5DF", pessoa: "CRM", hora: "07:50", desc: "Lentidão normalizada pelo time de plataforma.", responsavel: "Samuel Moura", update: "há 4 h" },
    ],
  },
];

// Handover.
export const HANDOVER_STATS = [
  { label: "Ocorrências abertas", value: 3, color: "#A8202A" },
  { label: "Gaps ainda existentes", value: 2, color: "#8C5A0E" },
  { label: "Pendências de validação", value: 2, color: "#2940A8" },
  { label: "Trocas confirmadas", value: 1, color: "#3E7A23" },
];

export const HERDADOS = [
  { id: "h1", label: "Ausência sem contato — Isabel Duarte", meta: "Aberta há 4 h · Marcos Lima" },
  { id: "h2", label: "Gap de cobertura 14:00–15:00 no Chat", meta: "Sem cobertura alocada" },
  { id: "h3", label: "Gap de cobertura 19:00–20:00", meta: "Só Nina em operação" },
  { id: "h4", label: "Troca de turno Heitor × Nina", meta: "Aguardando confirmação da liderança" },
  { id: "h5", label: "2 alterações do DIM sem validação", meta: "Fechamento do turno da manhã" },
];

export const HANDOVER_BLOCKS = [
  { title: "O que aconteceu", text: "Turno iniciou com lentidão no CRM até 07:50. Volume de chat 12% acima do previsto entre 09:00 e 11:00, com 4 pessoas em linha.", placeholder: "Resumo dos fatos do turno" },
  { title: "O que precisa de atenção", text: "Isabel Duarte segue sem contato. Gap de cobertura confirmado para 14:00–15:00 no Chat.", placeholder: "Riscos e pontos em aberto" },
  { title: "O que deve continuar no próximo turno", text: "Acompanhar o caso escalonado do Diego e confirmar a troca entre Heitor e Nina.", placeholder: "Continuidades" },
  { title: "Links e referências", text: "Painel de fila em tempo real · Playbook de escalonamento · Planilha de trocas da semana.", placeholder: "Links úteis" },
];

export const RESUMO_TEXTO = "Turno manhã, 21/09. Time de 6 pessoas, 4 em atendimento. Isabel Duarte não iniciou o turno e segue sem contato, o que derruba o Backoffice para uma pessoa. Dois gaps de cobertura mapeados (14:00–15:00 no Chat e 19:00–20:00 no Backoffice), com opções já levantadas. Duas alterações do DIM aguardam validação.";

// Apoio.
export const STATUS_SISTEMAS = [
  { nome: "Fila de chat", estado: "Operacional", tone: "#3E7A23", soft: "#EAF5DF", dot: "#6FB344", nota: "Distribuição normal desde 09:23" },
  { nome: "CRM de atendimento", estado: "Degradado", tone: "#8C5A0E", soft: "#FBEFD0", dot: "#F0C26C", nota: "Lentidão intermitente ao abrir histórico" },
  { nome: "Integração da maquininha", estado: "Instável", tone: "#A8202A", soft: "#FDE7E7", dot: "#F49E9E", nota: "Falhas de leitura reportadas por 3 clientes" },
  { nome: "Painel de fila em tempo real", estado: "Operacional", tone: "#3E7A23", soft: "#EAF5DF", dot: "#6FB344", nota: "Sem incidentes nas últimas 24 h" },
];

export const MACROS = [
  { titulo: "Maquininha não liga", uso: "usada 48× na semana", texto: "Vamos testar juntos: conecte a Roxinha no carregador por 10 minutos e segure o botão ligar por 5 segundos." },
  { titulo: "Erro de leitura de cartão", uso: "usada 31×", texto: "Já verifiquei por aqui. Vamos limpar o leitor e testar uma venda de R$ 1,00 para confirmar." },
  { titulo: "Taxa não reconhecida", uso: "usada 22×", texto: "Consegui ver sua taxa aqui. Ela varia conforme a bandeira e o parcelamento, e está descrita no extrato da venda." },
  { titulo: "Prazo de recebimento", uso: "usada 19×", texto: "O valor da venda no débito cai em 1 dia útil. No crédito à vista, em 30 dias, ou na hora com antecipação." },
  { titulo: "Troca de titularidade", uso: "usada 7×", texto: "Essa alteração precisa passar pelo time de cadastro. Vou registrar seu pedido e te retorno com o prazo." },
];

export const GUIAS = [
  { title: "Como usar o DIM", desc: "Registro, intervalos de 1 hora e validação de fechamento." },
  { title: "Códigos e status", desc: "O que significa cada cor da timeline e quando usar cada código." },
  { title: "Cobertura", desc: "Como ler o mapa, identificar gaps e acionar quem está disponível." },
  { title: "Ocorrências", desc: "O que registrar, com que nível de detalhe e em quanto tempo." },
  { title: "Handover", desc: "Estrutura da passagem de turno e o que nunca pode ficar de fora." },
  { title: "Escalonamento", desc: "Quando subir um caso e por qual canal." },
  { title: "Contatos importantes", desc: "Lideranças, plataforma, suporte técnico e plantão." },
  { title: "Perguntas frequentes", desc: "As dúvidas que mais aparecem no meio do turno." },
];

// Equipes (aba Por equipe do DIM).
export const EQUIPES = [
  { lider: "Renata Alves", cluster: "Chat", status: "Saudável", tone: "#3E7A23", soft: "#EAF5DF", previstas: 4, ativas: 4, pend: 1 },
  { lider: "Marcos Lima", cluster: "Backoffice", status: "Atenção", tone: "#8C5A0E", soft: "#FBEFD0", previstas: 2, ativas: 1, pend: 1 },
];

export const RELATORIOS = [
  { title: "Aderência à escala", desc: "Comparação entre previsto e realizado por pessoa e cluster.", freq: "Diário" },
  { title: "Gaps de cobertura", desc: "Intervalos abaixo do mínimo e tempo total descoberto.", freq: "Semanal" },
  { title: "Pausas", desc: "Distribuição de pausas ao longo do dia e concentrações de risco.", freq: "Diário" },
  { title: "Ocorrências por tipo", desc: "Volume, tempo de resolução e reincidência.", freq: "Semanal" },
  { title: "Validações do DIM", desc: "Pendências de fechamento por liderança.", freq: "Diário" },
  { title: "Handovers", desc: "Passagens publicadas, atrasos e pendências herdadas.", freq: "Semanal" },
];

export const WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Histórico / detalhes usados em drawers.
export const PERSON_HISTORY = [
  { time: "09:40", text: "Pausa deslocada de 12:00 para 12:30", author: "Renata Alves" },
  { time: "08:12", text: "Alocação confirmada no cluster Chat", author: "Sistema" },
  { time: "Ontem", text: "Take de qualidade registrado no turno da tarde", author: "Marcos Lima" },
];

export const ALERT_STEPS = [
  { n: 1, text: "Confirme o número de pessoas disponíveis no intervalo." },
  { n: 2, text: "Acione as opções de cobertura sugeridas pelo sistema." },
  { n: 3, text: "Registre a alteração no DIM e avise a liderança do cluster." },
];

export const OC_UPDATES = [
  { time: "09:30", text: "Liderança acionada por telefone, sem retorno." },
  { time: "08:40", text: "Ocorrência aberta automaticamente pelo controle de presença." },
];

// Navegação da sidebar. `badge` numérico só quando houver pendência.
export const NAV = [
  { key: "hoje", label: "Hoje" },
  { key: "dim", label: "DIM" },
  { key: "cobertura", label: "Cobertura", badge: 2 },
  { key: "escalas", label: "Escalas" },
  { key: "pessoas", label: "Pessoas" },
  { key: "ocorrencias", label: "Ocorrências", badge: 3 },
  { key: "handover", label: "Handover" },
  { key: "apoio", label: "Apoio", badge: 1 },
  { key: "relatorios", label: "Relatórios" },
];

// Opções de filtro por tela.
export const FILTER_OPTIONS = {
  cluster: ["Todos", "Chat", "Backoffice"],
  lider: ["Todos", "Renata Alves", "Marcos Lima"],
  status: ["Todos", "Em atendimento", "Pausa", "Cobertura"],
  statusDim: ["Todos", "Em atendimento", "Pausa", "Pendente"],
  frente: ["Todas", "Receptivo", "Ativo", "Retenção"],
  tipo: ["Todos", "Atraso", "Ausência", "Falha de sistema", "Escalonamento"],
  resp: ["Todos", "Samuel Moura", "Renata Alves", "Tiago Barros"],
  horario: ["Todos", "Hoje", "Últimos 7 dias", "Este mês"],
  escala: ["Todas", "08:00–17:00", "09:00–18:00", "11:00–20:00"],
};

export const DATA_LABEL = "Segunda-feira, 21 de setembro";
