// ---------------------------------------------------------------------------
// relatorios.js — 6 cards de relatório. Tela de consistência (profundidade menor).
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { RELATORIOS } from "../data.js";
import { notify, atualizarSync } from "../actions.js";
import { staleBanner, tag } from "../components/primitives.js";

export function screenRelatorios() {
  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Relatórios", tag("mock")),
    h("div", { class: "page-date" }, "Exportações da operação"),
    h("div", { class: "grid section", style: { gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" } },
      RELATORIOS.map(relatorioCard)));
}

function relatorioCard(r) {
  return h("div", { class: "card card-hover" },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" } },
      h("h3", { class: "card-title", style: { fontSize: "16px" } }, r.title),
      h("span", { class: "meta", style: { flex: "0 0 auto" } }, r.freq)),
    h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)", margin: "8px 0 14px", lineHeight: 1.45 } }, r.desc),
    h("button", { class: "btn btn--secondary btn--sm", onClick: notify(`Exportação "${r.title}" enviada`) }, "Exportar"));
}
