// ---------------------------------------------------------------------------
// cobertura.js — mapa de cobertura, horários críticos e cobertura mínima.
// O drawer de sugestões (com custo da escolha) vem de components/drawer.js.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { HEAT_ROWS, HEATMAP, CRITICOS, MIN_TABLE } from "../data.js";
import { openSugestoes, atualizarSync } from "../actions.js";
import { filterChip, dot, sectionHead, staleBanner, tag } from "../components/primitives.js";
import { slots } from "../util.js";

function header() {
  return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
    h("div", {},
      h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Cobertura", tag("mock")),
      h("div", { class: "page-date" }, "Previsto × disponível por horário e frente")),
    h("div", { class: "filters" },
      filterChip("cluster", "cluster", "Cluster"),
      filterChip("frente", "frente", "Frente")));
}

function alertaCritico() {
  return h("div", { class: "card", style: { background: "var(--pj-danger-soft)", borderColor: "#F3C9CC", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" } },
    h("div", {},
      h("div", { style: { fontSize: "15px", fontWeight: 600, color: "var(--pj-danger)" } }, "Encontramos 2 horas abaixo da cobertura recomendada."),
      h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)", marginTop: "4px" } }, "14:00–15:00 no Chat (2 de 3) e 19:00–20:00 no Backoffice (só Nina).")),
    h("button", { class: "btn btn--danger", onClick: openSugestoes }, "Encontrar opções de cobertura"));
}

function mapa() {
  const s = slots();
  return h("div", { class: "card section", style: { overflowX: "auto" } },
    sectionHead("Mapa de cobertura por horário"),
    h("div", { style: { display: "flex", gap: "6px", marginBottom: "8px", paddingLeft: "116px" } },
      s.map((t) => h("div", { style: { width: "30px", textAlign: "center", fontSize: "10px", color: "var(--pj-ink-4)" } }, t.slice(0, 2)))),
    HEAT_ROWS.map((row) => h("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" } },
      h("span", { style: { width: "110px", fontSize: "12.5px", fontWeight: 600 } }, row.label),
      row.carga.map((v, i) => {
        const crit = v <= 1 && (i === 6 || i === 11);
        return h("button", { class: "heat__cell", title: `${s[i]} · carga ${v}/4`, onClick: openSugestoes,
          style: { background: HEATMAP[v], border: crit ? "2px solid #A8202A" : "1px solid transparent" } });
      }))),
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", flexWrap: "wrap", gap: "10px" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--pj-ink-3)" } },
        "menos", HEATMAP.slice(0, 6).map((c) => h("span", { style: { width: "16px", height: "12px", borderRadius: "3px", background: c } })), "mais"),
      h("span", { class: "meta" }, "Cobertura mínima: 4 pessoas por hora · ", h("a", { href: "#", onClick: (e) => { e.preventDefault(); openSugestoes(); } }, "Ajustar"))));
}

function criticoRow(c) {
  return h("div", { style: { display: "flex", alignItems: "center", gap: "12px" } },
    h("span", { style: { width: "4px", height: "34px", borderRadius: "2px", background: c.tone, flex: "0 0 4px" } }),
    h("div", { style: { flex: 1, minWidth: 0 } },
      h("div", { style: { fontSize: "13px", fontWeight: 600 } }, c.range),
      h("div", { class: "meta" }, c.desc)),
    h("button", { class: "btn btn--secondary btn--sm", onClick: openSugestoes }, c.action));
}

function criticos() {
  return h("div", { class: "card section" },
    sectionHead("Horários críticos"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      CRITICOS.map(criticoRow)));
}

function minima() {
  const faixas = ["manha", "almoco", "tarde", "noite"];
  const labels = { manha: "Manhã", almoco: "Almoço", tarde: "Tarde", noite: "Noite" };
  return h("div", { class: "card section" },
    sectionHead("Cobertura mínima por faixa"),
    h("table", { class: "table" },
      h("thead", {}, h("tr", {}, h("th", {}, "Cluster"), faixas.map((f) => h("th", {}, labels[f])))),
      h("tbody", {}, MIN_TABLE.map((row) => h("tr", {},
        h("td", { style: { fontWeight: 600 } }, row.cluster),
        faixas.map((f) => h("td", {}, String(row[f]))))))));
}

export function screenCobertura() {
  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(),
    alertaCritico(),
    mapa(),
    h("div", { class: "grid", style: { gridTemplateColumns: "1.4fr 1fr", alignItems: "start" } },
      criticos(),
      minima()));
}
