// ---------------------------------------------------------------------------
// escalas.js — grade pessoa × dias da semana. Tela de consistência (profundidade
// menor no primeiro protótipo).
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { PEOPLE, WEEK } from "../data.js";
import { atualizarSync } from "../actions.js";
import { avatar, staleBanner, tag } from "../components/primitives.js";

function cellFor(p, idx, dayIdx) {
  const weekend = (idx + dayIdx) % 7 === 5 || (idx + dayIdx) % 7 === 6;
  if (weekend) return { label: "Folga", bg: "#F6F3EC", fg: "#9E9B92" };
  return { label: p.escala, bg: "#F3EDFB", fg: "#4E0683" };
}

export function screenEscalas() {
  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Escalas", tag("mock")),
    h("div", { class: "page-date" }, "Semana atual · turnos, folgas e férias"),
    h("div", { class: "card section", style: { overflowX: "auto", padding: "6px 0" } },
      h("table", { class: "table" },
        h("thead", {}, h("tr", {}, h("th", { style: { paddingLeft: "20px" } }, "Pessoa"), WEEK.map((d) => h("th", {}, d)))),
        h("tbody", {}, PEOPLE.map((p, idx) => escalaRow(p, idx))))));
}

function escalaRow(p, idx) {
  return h("tr", {},
    h("td", { style: { paddingLeft: "20px" } }, h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
      avatar(p.nome, { size: 28, color: "#ECDFFF" }),
      h("span", { style: { fontSize: "12.5px", fontWeight: 600 } }, p.nome))),
    WEEK.map((_, dayIdx) => {
      const c = cellFor(p, idx, dayIdx);
      return h("td", {}, h("span", { style: { display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, background: c.bg, color: c.fg, whiteSpace: "nowrap" } }, c.label));
    }));
}
