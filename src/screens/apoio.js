// ---------------------------------------------------------------------------
// apoio.js — substitui "Playbook". Status dos sistemas, macros e guias.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { STATUS_SISTEMAS, MACROS, GUIAS } from "../data.js";
import { notify, atualizarSync } from "../actions.js";
import { dot, sectionHead, staleBanner, tag } from "../components/primitives.js";

function header() {
  return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
    h("div", {},
      h("h1", { class: "page-title", style: { fontSize: "40px", display: "inline-flex", alignItems: "center", gap: "12px" } }, "Apoio da ", h("span", { style: { color: "var(--pj-purple)" } }, "Roxinha"), tag("mock")),
      h("div", { class: "page-date" }, "Sistemas, macros e guias da operação")),
    h("input", { class: "input", type: "search", placeholder: "Buscar no apoio…", style: { maxWidth: "260px" }, "aria-label": "Buscar no apoio" }));
}

function sistemas() {
  return h("div", { class: "card section" },
    sectionHead("Status dos sistemas", h("button", { class: "btn btn--secondary btn--sm", onClick: notify("Relato de falha enviado ao time de plataforma") }, "Reportar falha")),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "2px" } },
      STATUS_SISTEMAS.map((s) => h("div", { style: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 6px", borderBottom: "1px solid var(--pj-border)" } },
        dot(s.dot, 9),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { style: { fontSize: "13px", fontWeight: 600 } }, s.nome),
          h("div", { class: "meta" }, s.nota)),
        h("span", { class: "status-pill", style: { background: s.soft, color: s.tone } }, s.estado)))));
}

function macros() {
  return h("div", { class: "card section" },
    sectionHead("Macros mais usadas"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      MACROS.map((m) => h("div", { style: { padding: "12px 14px", border: "1px solid var(--pj-border)", borderRadius: "12px" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" } },
          h("div", {}, h("span", { style: { fontSize: "13px", fontWeight: 600 } }, m.titulo), h("span", { class: "meta" }, "  ·  " + m.uso)),
          h("button", { class: "btn btn--secondary btn--sm", onClick: notify(`Macro "${m.titulo}" copiada`) }, "Copiar")),
        h("div", { style: { fontSize: "12px", color: "var(--pj-ink-2)", marginTop: "6px", lineHeight: 1.45 } }, m.texto)))));
}

function guias() {
  return h("div", { class: "section" },
    sectionHead("Guias da operação"),
    h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" } },
      GUIAS.map((g, i) => {
        const dark = i === 0 || i === 4;
        return h("button", { class: "card card-hover", style: { textAlign: "left", background: dark ? "#1E002F" : "#fff", borderColor: dark ? "#1E002F" : "var(--pj-border)", color: dark ? "#fff" : "inherit" }, onClick: notify(`Guia "${g.title}" (mock)`) },
          h("div", { style: { fontFamily: "var(--pj-font-display)", fontWeight: 600, fontSize: "13px", color: dark ? "#CBA5FD" : "var(--pj-purple)" } }, String(i + 1).padStart(2, "0")),
          h("div", { style: { fontSize: "14px", fontWeight: 600, marginTop: "8px" } }, g.title),
          h("div", { style: { fontSize: "12px", marginTop: "4px", lineHeight: 1.45, color: dark ? "rgba(244,241,233,0.66)" : "var(--pj-ink-3)" } }, g.desc));
      })));
}

export function screenApoio() {
  return h("div", { class: "screen screen--narrow", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(), sistemas(), macros(), guias());
}
