// ---------------------------------------------------------------------------
// ocorrencias.js — três colunas (Abertas / Em andamento / Resolvidas).
// Filtros, botão "Registrar ocorrência" (modal). Ocorrências criadas na
// sessão entram na coluna Abertas (mock, em memória). Trata "sem responsável".
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { OCORRENCIAS } from "../data.js";
import { openModal, openDrawer, atualizarSync } from "../actions.js";
import { filterChip, dot, staleBanner, tag } from "../components/primitives.js";

function header() {
  return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
    h("div", {},
      h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Ocorrências", tag("mock")),
      h("div", { class: "page-date" }, "Registro do turno · atualizado em tempo real")),
    h("button", { class: "btn btn--primary", onClick: openModal }, "Registrar ocorrência"));
}

function filtersBar() {
  return h("div", { class: "filters", style: { margin: "18px 0" } },
    filterChip("tipo", "tipo", "Tipo"),
    filterChip("cluster", "cluster", "Cluster"),
    filterChip("resp", "resp", "Responsável"),
    filterChip("horario", "horario", "Período"));
}

function matchesFilters(oc) {
  const f = state.filters;
  if (f.tipo !== "Todos" && oc.tipo !== f.tipo) return false;
  if (f.resp !== "Todos" && oc.responsavel !== f.resp) return false;
  return true;
}

function card(oc, colTitle, idx) {
  const critico = colTitle === "Abertas" && idx === 0 && !oc.novo;
  const semResp = !oc.responsavel;
  return h("button", {
    class: "card card-hover", style: { textAlign: "left", padding: "16px 18px" },
    onClick: () => openDrawer({ type: "oc", tipo: oc.tipo, pessoa: oc.pessoa, hora: oc.hora, desc: oc.desc, responsavel: oc.responsavel, update: oc.update }),
  },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" } },
      h("span", { class: "status-pill", style: { background: oc.soft, color: oc.tone, fontSize: "11px" } }, oc.tipo),
      h("span", { class: "meta" }, oc.hora),
    ),
    oc.novo ? h("div", { style: { marginTop: "8px" } }, tag("draft", "Nova nesta sessão")) : null,
    h("div", { style: { fontSize: "13.5px", fontWeight: 600, marginTop: "10px" } }, oc.pessoa),
    h("div", { style: { fontSize: "12px", color: "var(--pj-ink-2)", marginTop: "4px", lineHeight: 1.45 } }, oc.desc),
    critico ? h("div", { style: { display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", fontSize: "11.5px", fontWeight: 600, color: "var(--pj-danger)", background: "var(--pj-danger-soft)", padding: "4px 10px", borderRadius: "999px" } }, dot("#A8202A", 6), oc.semResposta || "Sem resposta") : null,
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--pj-border)" } },
      semResp
        ? h("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 600, color: "var(--pj-warn)" } }, dot("#F0C26C", 6), "Sem responsável")
        : h("span", { class: "meta" }, "Resp.: " + oc.responsavel),
      semResp
        ? h("span", { style: { fontSize: "11.5px", color: "var(--pj-purple-strong)", fontWeight: 600 } }, "Atribuir →")
        : h("span", { class: "meta" }, oc.update)),
  );
}

function column(col) {
  const seed = col.items.filter(matchesFilters);
  const extra = col.title === "Abertas" ? state.ocList.filter(matchesFilters) : [];
  const items = extra.concat(seed);
  return h("div", { style: { flex: 1, minWidth: "260px" } },
    h("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } },
      dot(col.tone, 9),
      h("span", { style: { fontSize: "13px", fontWeight: 600 } }, col.title),
      h("span", { class: "meta" }, "· " + items.length)),
    items.length
      ? h("div", { style: { display: "flex", flexDirection: "column", gap: "12px" } }, items.map((oc, i) => card(oc, col.title, i)))
      : h("div", { class: "card", style: { textAlign: "center", padding: "28px 16px", color: "var(--pj-ink-4)", fontSize: "12.5px" } }, "Nenhuma ocorrência neste recorte"));
}

export function screenOcorrencias() {
  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(),
    filtersBar(),
    h("div", { style: { display: "flex", gap: "18px", alignItems: "flex-start" } },
      OCORRENCIAS.map(column)));
}
