// ---------------------------------------------------------------------------
// pessoas.js — lista de pessoas com busca e filtros. "Ver perfil operacional"
// abre o mesmo drawer do DIM.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state, set } from "../state.js";
import { PEOPLE, TIMELINE, NOW_SLOT } from "../data.js";
import { openPerson, setQuery, atualizarSync } from "../actions.js";
import { avatar, dot, filterChip, staleBanner, tag } from "../components/primitives.js";
import { statusNow } from "../util.js";

function header() {
  return h("div", {},
    h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Pessoas", tag("mock")),
    h("div", { class: "page-date" }, "Time de hoje · perfil operacional em um clique"));
}

function toolbar() {
  return h("div", { style: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", margin: "18px 0" } },
    h("input", { id: "pessoas-search", class: "input", type: "search", placeholder: "Buscar pessoa…", value: state.query, onInput: setQuery, style: { maxWidth: "280px" }, "aria-label": "Buscar pessoa" }),
    filterChip("cluster", "cluster", "Cluster"),
    filterChip("lider", "lider", "Líder"),
    filterChip("escala", "escala", "Escala"),
    filterChip("status", "status", "Status"));
}

export function screenPessoas() {
  const f = state.filters;
  const q = state.query.trim().toLowerCase();
  const people = PEOPLE.filter((p) =>
    (f.cluster === "Todos" || p.cluster === f.cluster) &&
    (f.lider === "Todos" || p.lider === f.lider) &&
    (f.escala === "Todas" || p.escala === f.escala) &&
    (!q || p.nome.toLowerCase().includes(q)));

  const list = people.length
    ? h("div", { class: "card", style: { padding: "6px 0" } }, people.map((p) => {
        const code = statusNow(p, NOW_SLOT);
        return h("div", { style: { display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", borderBottom: "1px solid var(--pj-border)" } },
          avatar(p.nome, { size: 34, color: "#ECDFFF" }),
          h("div", { style: { flex: "1 1 160px", minWidth: 0 } },
            h("div", { style: { fontSize: "13.5px", fontWeight: 600 } }, p.nome),
            h("div", { class: "meta" }, p.lider)),
          h("div", { style: { flex: "0 0 100px" } }, h("div", { class: "col-label" }, "Cluster"), h("div", { style: { fontSize: "12.5px" } }, p.cluster)),
          h("div", { style: { flex: "0 0 110px" } }, h("div", { class: "col-label" }, "Escala"), h("div", { style: { fontSize: "12.5px" } }, p.escala)),
          h("div", { style: { flex: "0 0 90px" } }, h("div", { class: "col-label" }, "Pausa"), h("div", { style: { fontSize: "12.5px" } }, p.pausa)),
          h("div", { style: { flex: "0 0 140px", display: "flex", alignItems: "center", gap: "6px" } }, dot(TIMELINE[code].bg, 8), h("span", { style: { fontSize: "12px" } }, TIMELINE[code].label)),
          h("button", { class: "btn btn--secondary btn--sm", onClick: openPerson(p) }, "Ver perfil operacional"));
      }))
    : h("div", { class: "card" }, h("div", { class: "state" },
        h("div", { class: "state__title" }, "Nenhuma pessoa encontrada"),
        h("div", { class: "state__desc" }, "Ajuste os filtros ou limpe a busca."),
        h("button", { class: "btn btn--secondary btn--sm", onClick: () => set({ query: "" }) }, "Limpar busca")));

  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(), toolbar(), list);
}
