// ---------------------------------------------------------------------------
// dim.js — "DIM operacional". Grade do dia. Abas Por pessoa / Por cobertura /
// Por equipe. Seleção múltipla, ações em lote, drawer da pessoa (drag de pausa).
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state, set } from "../state.js";
import {
  PEOPLE, TIMELINE, CODE, HEAT_ROWS, HEATMAP, EQUIPES, DATA_LABEL,
} from "../data.js";
import {
  go, openModal, openPerson, openFechamento, toggleSel, bulk, clearSel, notify, atualizarSync, setQuery,
} from "../actions.js";
import { avatar, dot, filterChip, staleBanner, tag } from "../components/primitives.js";
import { slots, cells, pattern, initials, statusNow } from "../util.js";

function header() {
  return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
    h("div", {},
      h("div", { class: "saudacao" }, DATA_LABEL),
      h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "DIM operacional", tag("mock"))),
    h("div", { style: { display: "flex", gap: "10px" } },
      h("button", { class: "btn btn--primary", onClick: notify("Novo DIM criado para 21/09") }, "Criar DIM"),
      h("button", { class: "btn btn--secondary", onClick: notify("Exportação enviada para o seu e-mail") }, "Exportar"),
      h("button", { class: "btn btn--secondary", onClick: openFechamento }, "Validar fechamento")));
}

function contextBanner() {
  return h("div", { style: { background: "var(--pj-lavender-200)", border: "1px solid var(--pj-border-purple)", borderRadius: "12px", padding: "10px 16px", fontSize: "12.5px", color: "var(--pj-purple-deep)", margin: "16px 0" } },
    "Este DIM trabalha com intervalos de 1 hora. Ao final do dia, valide as alterações realizadas.");
}

function tabs() {
  const list = [["Por pessoa", "pessoa"], ["Por cobertura", "cobertura"], ["Por equipe", "equipe"]];
  return h("div", { role: "tablist", style: { display: "flex", gap: "22px", borderBottom: "1px solid var(--pj-border)", margin: "18px 0 16px" } },
    list.map(([label, key]) => {
      const on = state.dimTab === key;
      return h("button", {
        role: "tab", "aria-selected": String(on),
        onClick: () => set({ dimTab: key }),
        style: { padding: "0 0 10px", fontSize: "13.5px", fontWeight: on ? 600 : 500, color: on ? "var(--pj-purple-deep)" : "var(--pj-ink-3)", borderBottom: `2px solid ${on ? "var(--pj-purple)" : "transparent"}`, marginBottom: "-1px" },
      }, label);
    }));
}

function legend() {
  return h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "14px" } },
    Object.keys(TIMELINE).map((k) => h("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--pj-ink-2)" } },
      h("span", { style: { width: "12px", height: "12px", borderRadius: "3px", background: TIMELINE[k].bg, border: `1px solid ${TIMELINE[k].border}` } }), TIMELINE[k].label)));
}

function filtersBar() {
  return h("div", { class: "filters", style: { marginBottom: "14px" } },
    filterChip("cluster", "cluster", "Cluster"),
    filterChip("lider", "lider", "Líder"),
    filterChip("status", "statusDim", "Status"),
    h("input", {
      id: "dim-search", class: "input", type: "search", placeholder: "Buscar por pessoa…",
      value: state.query, onInput: setQuery, style: { maxWidth: "240px", padding: "8px 12px" },
      "aria-label": "Buscar por pessoa",
    }));
}

function filteredPeople() {
  const f = state.filters;
  const q = state.query.trim().toLowerCase();
  return PEOPLE.filter((p) =>
    (f.cluster === "Todos" || p.cluster === f.cluster) &&
    (f.lider === "Todos" || p.lider === f.lider) &&
    (!q || (p.nome + p.cluster + p.lider).toLowerCase().includes(q)));
}

function tablePessoa() {
  const s = slots();
  const people = filteredPeople();
  const rowH = state.profile.densidade === "Compacta" ? 44 : 56;

  if (!people.length) {
    return h("div", { class: "card" },
      h("div", { class: "state" },
        h("div", { class: "state__title" }, "Nenhuma pessoa encontrada"),
        h("div", { class: "state__desc" }, "Ajuste os filtros ou limpe a busca."),
        h("button", { class: "btn btn--secondary btn--sm", onClick: () => set({ query: "" }) }, "Limpar busca")));
  }

  const head = h("thead", {}, h("tr", {},
    h("th", { style: { width: "28px" } }, ""),
    h("th", { style: { width: "190px" } }, "Pessoa"),
    h("th", { style: { width: "96px" } }, "Escala"),
    h("th", { style: { width: "66px" } }, "Entrada"),
    h("th", { style: { width: "66px" } }, "Pausa"),
    h("th", { style: { width: "104px" } }, "Cluster"),
    h("th", {}, "Timeline · 08h → 20h"),
    h("th", { style: { width: "132px" } }, "Comentários")));

  const body = h("tbody", {}, people.map((p) => {
    const on = state.sel.includes(p.nome);
    const cs = cells(pattern(p), s);
    const pat = pattern(p);
    const pend = pat.includes("?") || pat.includes("x");
    return h("tr", { class: on ? "is-selected" : "", style: { height: rowH + "px" } },
      h("td", {}, h("span", { class: "checkbox" + (on ? " is-on" : ""), role: "checkbox", "aria-checked": String(on), tabindex: "0", onClick: toggleSel(p.nome), onKeydown: (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggleSel(p.nome)(e); } } }, on ? "✓" : "")),
      h("td", {}, h("button", { onClick: openPerson(p), style: { display: "flex", alignItems: "center", gap: "9px", textAlign: "left", width: "100%" } },
        avatar(p.nome, { size: 30, color: "#ECDFFF" }),
        h("div", { style: { minWidth: 0 } },
          h("div", { style: { fontSize: "12.5px", fontWeight: 600 } }, p.nome),
          h("div", { class: "meta" }, p.lider)))),
      h("td", { style: { fontSize: "12px", color: "var(--pj-ink-2)" } }, p.escala),
      h("td", { style: { fontSize: "12px" } }, p.entrada),
      h("td", { style: { fontSize: "12px" } }, p.pausa),
      h("td", {}, h("span", { class: "status-pill", style: { background: "var(--pj-lavender-200)", color: "var(--pj-purple-deep)", fontSize: "11px" } }, p.cluster)),
      h("td", {}, h("div", { class: "tl" }, cs.map((c) => h("div", { class: "tl__cell", title: c.title, style: { background: c.bg, border: `1px solid ${c.border}` } })))),
      h("td", {}, h("div", { style: { display: "flex", alignItems: "center", gap: "6px" } },
        pend ? dot("#A8202A", 7) : null,
        h("div", { style: { minWidth: 0 } },
          h("button", { onClick: openModal, style: { fontSize: "11px", color: "var(--pj-purple-strong)", fontWeight: 600 } }, "Ocorrência"),
          p.comentario ? h("div", { class: "meta", style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "112px" } }, p.comentario) : null))));
  }));

  return h("div", { class: "card", style: { padding: "6px 12px 12px", overflowX: "auto" } },
    h("table", { class: "table" }, head, body));
}

function bulkBar() {
  if (!state.sel.length) return null;
  return h("div", { class: "bulkbar" },
    h("span", { style: { fontWeight: 600, fontSize: "13px" } }, `${state.sel.length} selecionadas`),
    h("div", { style: { flex: 1 } }),
    h("button", { class: "btn btn--sm", style: { background: "rgba(255,255,255,0.14)", color: "#fff" }, onClick: bulk("Pausa deslocada em 1 hora") }, "Deslocar pausa +1 hora"),
    h("button", { class: "btn btn--sm", style: { background: "rgba(255,255,255,0.14)", color: "#fff" }, onClick: bulk("Cobertura 14:00–15:00 alocada") }, "Alocar cobertura 14:00–15:00"),
    h("button", { class: "btn btn--sm", style: { background: "transparent", color: "#CBA5FD" }, onClick: clearSel }, "Limpar"));
}

function tabCobertura() {
  const s = slots();
  return h("div", { class: "card", style: { overflowX: "auto" } },
    h("h3", { class: "card-title", style: { fontSize: "16px", marginBottom: "14px" } }, "Carga por frente · intervalos de 1 hora"),
    h("div", { style: { display: "flex", gap: "6px", marginBottom: "8px", paddingLeft: "110px" } },
      s.map((t) => h("div", { style: { width: "30px", textAlign: "center", fontSize: "10px", color: "var(--pj-ink-4)" } }, t.slice(0, 2)))),
    HEAT_ROWS.map((row) => h("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" } },
      h("span", { style: { width: "104px", fontSize: "12.5px", fontWeight: 600 } }, row.label),
      row.carga.map((v, i) => h("div", { class: "heat__cell", title: `${s[i]} · carga ${v}/4`, style: { background: HEATMAP[v], border: (v <= 1 && (i === 6 || i === 11)) ? "1px solid #A8202A" : "1px solid transparent" } })))),
    h("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "11px", color: "var(--pj-ink-3)" } },
      "menos", HEATMAP.slice(0, 6).map((c) => h("span", { style: { width: "16px", height: "12px", borderRadius: "3px", background: c } })), "mais"));
}

function tabEquipe() {
  return h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" } },
    EQUIPES.map((e) => h("div", { class: "card" },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        h("div", {},
          h("div", { style: { fontSize: "14px", fontWeight: 600 } }, e.lider),
          h("div", { class: "meta" }, e.cluster)),
        h("span", { class: "status-pill", style: { background: e.soft, color: e.tone } }, dot(e.tone, 7), e.status)),
      h("div", { style: { display: "flex", gap: "18px", marginTop: "16px" } },
        stat("Previstas", e.previstas), stat("Em atendimento", e.ativas), stat("Pendências", e.pend)))));
}

function stat(label, value) {
  return h("div", {},
    h("div", { class: "num-2", style: { fontSize: "24px" } }, String(value)),
    h("div", { class: "meta", style: { marginTop: "2px" } }, label));
}

export function screenDim() {
  let content;
  if (state.dimTab === "cobertura") content = tabCobertura();
  else if (state.dimTab === "equipe") content = tabEquipe();
  else content = [legend(), tablePessoa(), bulkBar()];

  return h("div", { class: "screen screen--dim", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(),
    contextBanner(),
    state.dimTab === "pessoa" ? filtersBar() : null,
    tabs(),
    content);
}
