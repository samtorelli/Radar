# Migração para AI Lab Webapp Kit (app efêmero)

Este documento orienta a migração do protótipo **Central da Roxinha** (vanilla JS,
esta branch) para um projeto **AI Lab Webapp Kit** (React + Vite + Express),
publicável como app **efêmero** via `nu ai-lab`.

> ⚠️ A migração e o deploy **rodam na sua máquina** (Cursor local), onde existem o
> `nu` CLI logado, Docker e a rede Nubank. O agente cloud não alcança seu disco
> (`/Users/...`) nem o toolchain do AI Lab.

---

## Fonte-da-verdade (origem da migração)

Repositório `samtorelli/radar`, branch **`cursor/central-da-roxinha-prototipo-8bb9`**.

O que reaproveitar (sem reescrever a lógica):

| Origem (esta branch) | Papel | Vai para (AI Lab) |
|---|---|---|
| `src/data.js` | **Camada de dados única** (mock) | `src/.../models` + um adapter/wire (diplomat) — mantém a mesma forma para trocar por API depois |
| `src/screens/*.js` | 9 telas (lógica + markup) | Componentes React por rota (React Router lazy) |
| `src/components/*.js` | sidebar, drawer, modal, toast, primitivos | Componentes React reutilizáveis |
| `src/state.js` | estado + persistência (localStorage) | Context/store do template (ou Zustand/Context) |
| `src/actions.js` | comportamentos (toast/undo, drag, filtros) | hooks/handlers |
| `src/util.js` | helpers de timeline | util puro (copiar quase 1:1) |
| `assets/css/pj-tokens.css` | tokens PJ + `@font-face` | tokens globais / theme (antd via Nu theme) |
| `assets/fonts/*.otf` | Nu Sans (Neutral) | `public/`/assets do template |
| `assets/css/app.css` | layout/estados/responsividade | CSS/estilos do template |

Referência viva: abra `central-da-roxinha.html` (arquivo único) para ver o alvo
visual/comportamental enquanto porta.

## Mapa de rotas (React Router)

`/hoje` (default) · `/dim` · `/cobertura` · `/escalas` · `/pessoas` ·
`/ocorrencias` · `/handover` · `/apoio` · `/relatorios`.
Hoje uso hash-router; no template, usar o roteador do kit.

## Interações a preservar

Navegação por rota, filtros que ciclam, abas do DIM, busca por pessoa, drawers
(fecham por ×/clique fora/Esc), modal de ocorrência, seleção múltipla + ações em
lote, toast com **desfazer**, checklist do handover, **arrastar pausa**, alternância
"Próximas 4h / Dia inteiro", hover/estados ativos, atalhos de teclado
(H/D/C/O/G/`/`/`?`/Esc), persistência de preferências.

## Regras que continuam valendo

- Handover só publica **após revisão humana** (resumo = rascunho editável).
- Ocorrência pode existir **sem responsável**; estados loading/vazio/erro/desatualizado.
- Ícone da maquininha é **placeholder exploratório** (não logo oficial); nenhum
  asset pessoal. Fontes Nu Sans são de uso interno.
- Sem backend real nesta etapa: manter a camada de dados isolada para troca por API.

---

## Passo a passo (no Cursor da sua máquina)

1. Baixe/abra um projeto compatível do **AI Lab** (plataforma AI Lab) — este é o
   `my-project` (`/Users/sam.torelli/Downloads/my-project`).
2. Garanta `nu` CLI logado (`nu ai-lab login`), Docker rodando e rede Nubank.
3. Com o `my-project` aberto, rode o fluxo de migração do plugin apontando esta
   branch como origem (prompt pronto abaixo).
4. Faça o deploy efêmero: o agente `webapp-deploy` roda `nu ai-lab` e devolve a URL
   temporária (app efêmero é apagado ~14 dias após o 1º deploy).
5. Se precisar de segredos, use os **ephemeral secrets** do AI Lab (nunca no código).

### Prompt pronto para colar no Cursor local (dentro do `my-project`)

```
Migrar o protótipo "Central da Roxinha" para este projeto AI Lab Webapp Kit.

Origem: repositório github.com/samtorelli/radar, branch
cursor/central-da-roxinha-prototipo-8bb9. Use como referência visual/comportamental
o arquivo central-da-roxinha.html e MIGRATION-AI-LAB.md dessa branch.

Preserve a arquitetura do template (React + Vite + Express, hexagonal, React Router
lazy, @/* alias, antd via Nu theme, SystemProvider/DI). NÃO porte support.js.

Escopo:
- 9 rotas: hoje (default), dim, cobertura, escalas, pessoas, ocorrencias, handover,
  apoio, relatorios. Alta fidelidade em Hoje/DIM/Cobertura/Ocorrencias/Handover.
- Camada de dados única a partir de src/data.js (mesma forma; deixar pronta para API).
- Preservar interações: filtros, abas do DIM, busca, drawers (Esc/scrim/x), modal de
  ocorrência, seleção múltipla + ações em lote, toast com desfazer, arrastar pausa,
  checklist do handover (resumo só publica após revisão), atalhos de teclado.
- Tokens: assets/css/pj-tokens.css; fontes Nu Sans em assets/fonts (Neutral).
Ao final: rodar o app localmente, validar o fluxo e preparar o deploy efêmero
(nu ai-lab) sem publicar segredos no código.
```

> O agente `webapp-migrate` do plugin AI Lab foi feito para exatamente isso:
> analisa o codebase legado, cria o plano e reimplementa as telas no template.

---

## O que o agente cloud pode adiantar

- Manter esta branch como origem limpa (feito).
- (Opcional) Portar as telas para componentes React "de apresentação" prontos para
  encaixar na pasta de features do template — peça se quiser que eu gere.
