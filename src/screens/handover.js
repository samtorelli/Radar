// ---------------------------------------------------------------------------
// handover.js — passagem de turno. O resumo NUNCA é publicado automaticamente:
// aparece como rascunho editável e exige revisão humana antes de publicar.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { HANDOVER_STATS, HERDADOS, HANDOVER_BLOCKS, RESUMO_TEXTO, DATA_LABEL } from "../data.js";
import { gerarResumo, descartarResumo, publicarPassagem, toggleCheck, atualizarSync } from "../actions.js";
import { dot, sectionHead, staleBanner, tag } from "../components/primitives.js";

function header() {
  return h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
    h("div", {},
      h("div", { class: "saudacao" }, DATA_LABEL + " · turno da manhã"),
      h("h1", { class: "page-title page-title--std", style: { display: "inline-flex", alignItems: "center", gap: "10px" } }, "Handover", tag("mock"))),
    h("div", { style: { display: "flex", gap: "10px" } },
      h("button", { class: "btn btn--secondary", onClick: gerarResumo }, "Gerar resumo do turno"),
      h("button", { class: "btn btn--primary", onClick: publicarPassagem }, "Publicar passagem")));
}

function stats() {
  return h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: "22px" } },
    HANDOVER_STATS.map((s) => h("div", { class: "card" },
      h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, dot(s.color, 8), h("span", { style: { fontSize: "12px", color: "var(--pj-ink-2)" } }, s.label)),
      h("div", { class: "num-kpi", style: { marginTop: "10px" } }, String(s.value)))));
}

function herdados() {
  return h("div", { class: "card section" },
    sectionHead("Itens herdados do turno", h("span", { class: "meta" }, `${state.checks.length} de ${HERDADOS.length} marcados`)),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
      HERDADOS.map((it) => {
        const on = state.checks.includes(it.id);
        return h("button", {
          onClick: toggleCheck(it.id), role: "checkbox", "aria-checked": String(on),
          style: { display: "flex", alignItems: "center", gap: "12px", textAlign: "left", padding: "12px 14px", border: "1px solid var(--pj-border)", borderRadius: "12px", background: on ? "var(--pj-surface-muted)" : "#fff", width: "100%" },
        },
          h("span", { class: "checkbox" + (on ? " is-on" : ""), style: { flex: "0 0 18px" } }, on ? "✓" : ""),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { style: { fontSize: "13px", fontWeight: 600, color: on ? "var(--pj-ink-3)" : "var(--pj-ink-1)", textDecoration: on ? "line-through" : "none" } }, it.label),
            h("div", { class: "meta" }, it.meta)),
          h("span", { style: { fontSize: "11px", fontWeight: 600, color: on ? "var(--pj-ok)" : "var(--pj-warn)" } }, on ? "Passado adiante" : "Pendente"));
      })));
}

function resumo() {
  if (!state.resumo) {
    return h("div", { class: "card section", style: { borderStyle: "dashed", textAlign: "center", padding: "28px" } },
      h("div", { style: { fontSize: "13px", color: "var(--pj-ink-3)", marginBottom: "12px" } }, "Nenhum resumo gerado ainda. O resumo aparece como rascunho e exige sua revisão antes de publicar."),
      h("button", { class: "btn btn--secondary btn--sm", onClick: gerarResumo }, "Gerar resumo do turno"));
  }
  return h("div", { class: "card section", style: { background: "var(--pj-lavender-200)", borderColor: "var(--pj-border-purple)" } },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
        h("h2", { class: "card-title", style: { fontSize: "17px" } }, "Resumo gerado"), tag("draft", "Rascunho")),
      h("button", { class: "btn btn--ghost btn--sm", onClick: descartarResumo }, "Descartar")),
    h("textarea", { class: "textarea", rows: "4", style: { background: "#fff" } }, RESUMO_TEXTO),
    h("div", { class: "meta", style: { marginTop: "8px" } }, "Revise antes de publicar. Nada é enviado automaticamente."));
}

function blocks() {
  return h("div", { class: "grid section", style: { gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" } },
    HANDOVER_BLOCKS.map((b) => h("div", { class: "card" },
      h("div", { class: "col-label", style: { marginBottom: "8px" } }, b.title),
      h("textarea", { class: "textarea", rows: "3", placeholder: b.placeholder }, b.text))));
}

export function screenHandover() {
  return h("div", { class: "screen screen--narrow", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(),
    stats(),
    herdados(),
    resumo(),
    blocks());
}
