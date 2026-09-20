# Central da Roxinha — protótipo navegável

Cockpit operacional do atendimento da **Roxinha** (a maquininha do Nu, segmento PJ).
Usado por Ops e lideranças para acompanhar a operação do dia, consultar o DIM,
identificar gaps de cobertura, registrar ocorrências e fazer a passagem de turno.

> **"Escala, cobertura e operação em um só lugar."**

Prova o fluxo: **perceber um risco → investigar → agir → registrar → passar o contexto adiante.**

---

## Como rodar

Sem build. Vanilla JS (ES modules) + servidor estático de arquivos.

```bash
npm start          # servidor em http://localhost:5173
# ou
PORT=8080 npm start
# ou, sem Node:
python3 -m http.server 5173
```

Abra `http://localhost:5173`. Requer um servidor HTTP (ES modules não carregam via `file://`).

### Validação (o "build" do projeto)

```bash
npm run validate   # checa sintaxe de todo o JS, resolução de imports e assets essenciais
```

---

## Stack e arquitetura

- **Vanilla JS, sem framework, sem build.** Mesma abordagem do codebase original e do protótipo de handoff — nenhuma arquitetura paralela foi criada.
- Mini-runtime de DOM próprio (`src/dom.js`, hyperscript) — substitui o `support.js` do handoff, que **não** foi portado.
- **Camada de dados única** em `src/data.js` (fonte da verdade; nenhum número/nome espalhado pelas telas).
- Estado global observável + persistência de preferências (`src/state.js`).
- Hash-router (`src/router.js`) — a rota sobrevive a reload.

```
index.html               shell
assets/css/              pj-tokens.css, colors_and_type.css (DS), app.css
assets/fonts/            Nu Sans Display + Nu Sans Text (Neutral, OTF)
src/
  dom.js                 hyperscript (h, mount)
  data.js                CAMADA DE DADOS ÚNICA (mock)
  state.js               store + persistência (localStorage: roxinha.prefs)
  router.js              hash-router
  util.js                helpers de timeline
  actions.js             comportamentos (toast/undo, drag, seleção, drawers…)
  app.js                 entry + render loop + atalhos de teclado
  components/            sidebar, drawer, modal, toast, primitives, icons
  screens/               hoje, dim, cobertura, ocorrencias, handover,
                         pessoas, escalas, apoio, relatorios
server.js                servidor estático (zero dependências)
scripts/validate.mjs     validação sem build
legacy/radar.html        projeto anterior (Radar) preservado
```

---

## Telas

Alta fidelidade: **Hoje, DIM, Cobertura, Ocorrências, Handover.**
Acessíveis com profundidade menor: **Pessoas, Escalas, Apoio, Relatórios.**

## Cenário (dados fictícios, coerentes entre telas)

6 pessoas · 4 em atendimento · 1 em pausa · 2 gaps de cobertura · gap crítico
14:00–15:00 no Chat · 1 ausência sem contato (Isabel) · 1 troca de turno
aguardando confirmação (Heitor × Nina) · 2 pendências de validação do DIM.

---

## O que é real, simulado e pendente

**Implementado (interações reais):** navegação/rotas, filtros que ciclam, abas do
DIM, busca por pessoa, drawers (fecham por ×, clique fora e Esc), modal de
ocorrência, seleção múltipla + ações em lote, toasts, desfazer, checklist do
handover, arrastar pausa na timeline individual, alternância "Próximas 4h / Dia
inteiro", hover/estados ativos, atalhos de teclado (H/D/C/O/G/`/`/`?`/Esc),
persistência de preferências (perfil + filtros) em `localStorage`, indicador de
sincronização, foto de perfil reduzida a 160×160.

**Simulado (mock):** todos os dados (pessoas, cobertura, ocorrências, handover,
apoio). Ocorrências criadas na sessão vivem em memória (`state.ocList`) e somem no
reload. Etiquetas "Dados fictícios" / "Rascunho" marcam a proveniência na UI.

**Estados visuais existentes:** carregamento, vazio, erro, dado desatualizado,
sucesso (toast), ação desfeita, ocorrência **sem responsável**, gap **sem opções**
de cobertura (drawer filtrado por cluster sem sugestões).

**Pendente / limitações:**
- Sem backend, autenticação ou integração real (fora do escopo desta etapa). A
  camada de dados está isolada em `src/data.js` para troca futura por API.
- Recorte de dados por papel (Supervisão / Planejamento / Ops) — decisão em aberto
  no handoff, **não** implementada.
- Ícone da maquininha é **placeholder exploratório**, não logo oficial. Nenhum asset
  pessoal (ex.: `badge-roxinha-4k.png`) é usado.
- `colors_and_type.css` (DS): removidos os `@font-face` de variantes Cnd/Ext/Italic
  não incluídas no handoff; usam-se apenas os 9 pesos Neutral via `pj-tokens.css`.
- Abaixo de ~1100px a sidebar colapsa em drawer (botão de menu); o refinamento
  mobile completo fica para uma próxima etapa.

---

## Roteiro de smoke test (manual)

1. Abre em **Hoje**: saúde da operação, riscos, gráfico com marcador de "agora".
2. Navega pela **sidebar** (item ativo destacado; badges em Cobertura/Ocorrências/Apoio).
3. Em **Cobertura**, clica "Encontrar opções de cobertura" → drawer com sugestões
   e **custo da escolha**. Fecha com Esc.
4. Em **DIM**, filtra/busca, marca 2+ pessoas → barra de ação em lote → "Deslocar
   pausa" → toast com **Desfazer** → desfaz.
5. Abre o drawer de uma pessoa e **arrasta a pausa** na timeline (soltar fora do
   horário é recusado).
6. Em **Ocorrências**, "Registrar ocorrência" → Publicar (sem responsável) →
   card novo entra em "Abertas" com aviso "Sem responsável".
7. Em **Handover**, "Gerar resumo do turno" → aparece como **rascunho** editável
   (nunca publica sozinho). Marca itens herdados no checklist.
8. Atalho **G** abre o próximo gap; **Esc** fecha overlays.
9. Recarrega a página: a navegação **não quebra** (rota preservada).
10. Console **sem erros** durante todo o fluxo.

Smoke test automatizado (headless) cobre esses 10 passos + responsividade — ver a
seção de validação no PR.

---

## Origem

Recriado a partir do design handoff `design_handoff_central_roxinha` (README, tokens,
fontes e o protótipo `Central da Roxinha.dc.html`). O `.dc.html` e o `support.js` são
referência visual/comportamental, não código de produção.
