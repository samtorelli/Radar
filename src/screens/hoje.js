// ---------------------------------------------------------------------------
// hoje.js — "A operação de hoje". Responde: saudável agora? onde está o risco?
// o que precisa de ação? qual o próximo movimento?
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state, set } from "../state.js";
import {
  KPIS, COVERAGE_BASE, COVERAGE_MIN, NOW_SLOT, NOW_LABEL, RISCOS, ADERENCIA,
  ALERTS, MOVES, PEOPLE, DATA_LABEL, CODE, TIMELINE,
} from "../data.js";
import { go, openModal, openDrawer, openSugestoes, openPerson, cycleFilter, atualizarSync } from "../actions.js";
import { avatar, dot, filterChip, sectionHead, kicker, staleBanner, tag } from "../components/primitives.js";
import { slots, statusNow, firstName } from "../util.js";

function header() {
  const p = state.profile;
  return h("div", {},
    h("div", { class: "saudacao" }, p.saudacao),
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" } },
      h("div", {},
        h("h1", { class: "page-title page-title--home" }, "A operação de hoje"),
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" } },
          h("span", { class: "chip", style: { gap: "8px" } }, h("span", { style: { width: "10px", height: "10px", borderRadius: "3px", background: "var(--pj-purple)" } }), DATA_LABEL),
          tag("mock"))),
      h("div", { style: { display: "flex", gap: "10px" } },
        h("button", { class: "btn btn--primary", onClick: go("dim") }, "Abrir DIM"),
        h("button", { class: "btn btn--secondary", onClick: openModal }, "Registrar ocorrência"))));
}

function squad() {
  const s = slots();
  return h("div", { class: "card", style: { marginTop: "22px", padding: "16px 18px" } },
    h("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" } },
      PEOPLE.map((p) => {
        const code = statusNow(p, NOW_SLOT);
        return h("button", {
          class: "chip", onClick: openPerson(p), style: { padding: "6px 12px 6px 6px", gap: "8px" },
        },
          avatar(p.nome, { size: 26, color: "#ECDFFF" }),
          h("span", { style: { fontWeight: 600, fontSize: "12.5px" } }, firstName(p.nome)),
          h("span", { class: "meta" }, p.cluster),
          dot(TIMELINE[code].bg, 7));
      })));
}

function kpiCards() {
  return h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: "22px" } },
    KPIS.map((k) => h("button", { class: "card card-hover", style: { textAlign: "left" }, onClick: go(k.to) },
      h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, dot(k.dot, 8), h("span", { style: { fontSize: "12px", color: "var(--pj-ink-2)" } }, k.label)),
      h("div", { class: "num-kpi", style: { color: k.color, margin: "10px 0 4px" } }, String(k.value)),
      h("div", { class: "meta" }, k.hint))));
}

function riscoBlock(r) {
  return h("button", {
    class: "card card-hover", style: { textAlign: "left", background: r.soft, borderColor: "transparent" },
    onClick: r.action === "sugestoes" ? openSugestoes : go("cobertura"),
  },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
      h("span", { style: { fontFamily: "var(--pj-font-display)", fontWeight: 600, fontSize: "17px", color: r.tone } }, r.time),
      h("span", { style: { fontSize: "11.5px", fontWeight: 600, color: r.tone } }, r.delta)),
    h("div", { style: { fontSize: "13.5px", fontWeight: 600, marginTop: "8px" } }, r.label),
    h("div", { style: { fontSize: "12px", color: "var(--pj-ink-2)", marginTop: "3px" } }, r.detalhe));
}

function riscoBlocks() {
  return h("div", { class: "section" },
    sectionHead("Risco nas próximas 2 horas"),
    h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" } },
      RISCOS.map(riscoBlock)));
}

function aderencia() {
  return h("div", { class: "card" },
    h("h3", { class: "card-title", style: { fontSize: "16px", marginBottom: "14px" } }, "Aderência por cluster"),
    ADERENCIA.map((a) => h("div", { style: { marginBottom: "12px" } },
      h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "5px" } },
        h("span", { style: { fontWeight: 600 } }, a.cluster),
        h("span", { style: { color: a.tone, fontWeight: 600 } }, `${a.real}/${a.prev} · ${a.pct}%`)),
      h("div", { style: { height: "6px", borderRadius: "999px", background: "var(--pj-surface-muted)", overflow: "hidden" } },
        h("div", { style: { height: "100%", width: a.pct + "%", background: a.tone, borderRadius: "999px" } })))));
}

// Gráfico da operação (barras empilhadas por hora).
function operacaoAgora() {
  const s = slots();
  const near = state.horizonte === "Próximas 4h";
  const H0 = near ? NOW_SLOT : 0;
  const H1 = near ? Math.min(NOW_SLOT + 4, 12) : 12;
  const MAXH = 140;
  const cols = COVERAGE_BASE.map((v, i) => {
    const low = v < COVERAGE_MIN;
    const pau = v >= 5 ? 1 : 0;
    const cov = i === 6 || i === 7 ? 1 : 0;
    const att = Math.max(v - pau - cov, 0);
    const unit = MAXH / 7;
    return { i, v, low, att, cov, pau, unit,
      attColor: low ? "#A8202A" : (i === NOW_SLOT ? "#6E08B3" : "#8D0DE3"),
      isNow: i === NOW_SLOT, tick: s[i] };
  }).slice(H0, H1);

  const seg = (hpx, color) => hpx > 0 ? h("div", { style: { height: hpx + "px", background: color, borderRadius: "3px" } }) : null;

  return h("div", { class: "card", style: { padding: "22px 24px" } },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" } },
      h("div", {},
        h("div", { class: "col-label" }, "Operação agora"),
        h("div", { style: { display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" } },
          h("span", { class: "num-2" }, NOW_LABEL),
          h("span", { class: "status-pill", style: { background: "var(--pj-ok-soft)", color: "var(--pj-ok)" } }, dot("#6FB344", 7), "Cobertura saudável"))),
      h("div", { style: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" } },
        filterChip("cluster", "cluster", "Cluster"),
        filterChip("lider", "lider", "Líder"),
        filterChip("status", "status", "Status"),
        h("div", { style: { display: "inline-flex", background: "var(--pj-surface-muted)", borderRadius: "999px", padding: "3px", gap: "3px" } },
          hzChip("Próximas 4h"), hzChip("Dia inteiro")))),

    h("div", { style: { display: "flex", alignItems: "flex-end", gap: "6px", height: MAXH + "px", marginTop: "22px", paddingTop: "8px" } },
      cols.map((c) => h("div", { title: `${c.tick} · ${c.v} de 6 pessoas${c.isNow ? " · agora" : ""}`,
        onClick: c.low ? go("cobertura") : go("dim"),
        style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", height: "100%", cursor: "pointer", position: "relative" } },
        c.isNow ? h("div", { style: { position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "3px", height: "10px", borderRadius: "2px", background: "#1E002F" } }) : null,
        seg(c.pau * c.unit, "#F0C26C"),
        seg(c.cov * c.unit, "#B6C3FB"),
        seg(c.att * c.unit, c.attColor)))),
    h("div", { style: { display: "flex", gap: "6px", marginTop: "6px" } },
      cols.map((c) => h("div", { style: { flex: 1, textAlign: "center", fontSize: "10.5px", fontWeight: c.low || c.isNow ? 600 : 400, color: c.low ? "#A8202A" : (c.isNow ? "#1E002F" : "#9E9B92") } }, c.tick.slice(0, 2) + "h"))),

    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "10px" } },
      h("div", { style: { display: "flex", gap: "14px", flexWrap: "wrap" } },
        legendItem("Em atendimento", "#8D0DE3"), legendItem("Cobertura", "#B6C3FB"),
        legendItem("Pausa", "#F0C26C"), legendItem("Abaixo do mínimo", "#A8202A")),
      h("span", { class: "meta" }, "Cobertura mínima: 4 pessoas por hora")),
    h("div", { style: { marginTop: "14px" } },
      h("button", { class: "btn btn--ghost btn--sm", onClick: go("dim") }, "Ver DIM completo →")));
}

function hzChip(label) {
  const on = state.horizonte === label;
  return h("button", {
    onClick: () => set({ horizonte: label }),
    style: {
      border: "none", borderRadius: "999px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
      background: on ? "#1E002F" : "transparent", color: on ? "#fff" : "var(--pj-ink-2)",
    },
  }, label);
}

function legendItem(label, color) {
  return h("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--pj-ink-2)" } },
    h("span", { style: { width: "10px", height: "10px", borderRadius: "3px", background: color } }), label);
}

function pontosAtencao() {
  return h("div", { class: "section" },
    sectionHead("Pontos de atenção"),
    h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" } },
      ALERTS.map((a, i) => h("button", {
        class: "card card-hover", style: { textAlign: "left" },
        onClick: () => openDrawer({ type: "alert", i, tone: a.tone, soft: a.soft, title: a.title, desc: a.desc, subtitle: a.time }),
      },
        h("div", { style: { display: "flex", gap: "12px", alignItems: "flex-start" } },
          h("span", { style: { width: "26px", height: "26px", borderRadius: "8px", background: a.soft, color: a.tone, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flex: "0 0 26px" } }, a.glyph),
          h("div", { style: { minWidth: 0 } },
            h("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
              h("span", { style: { fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, color: a.tone } }, a.sev),
              h("span", { class: "meta" }, a.time)),
            h("div", { style: { fontSize: "13.5px", fontWeight: 600, marginTop: "4px" } }, a.title),
            h("div", { style: { fontSize: "12px", color: "var(--pj-ink-2)", marginTop: "3px", lineHeight: 1.45 } }, a.desc),
            h("div", { style: { fontSize: "12px", color: "var(--pj-purple-strong)", fontWeight: 600, marginTop: "8px" } }, a.action + " →")))))));
}

function proximosMovimentos() {
  return h("div", { class: "card card--deep", style: { marginTop: "20px" } },
    h("div", { class: "col-label", style: { color: "#CBA5FD" } }, "Próximos movimentos"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" } },
      MOVES.map((m) => h("div", { style: { display: "flex", gap: "14px", alignItems: "baseline" } },
        h("span", { style: { fontFamily: "var(--pj-font-display)", fontWeight: 600, fontSize: "15px", color: "#CBA5FD", flex: "0 0 52px" } }, m.time),
        h("div", {},
          h("div", { style: { fontSize: "13.5px", fontWeight: 600, color: "#fff" } }, m.title),
          h("div", { style: { fontSize: "12px", color: "rgba(244,241,233,0.62)", marginTop: "2px" } }, m.desc))))));
}

export function screenHoje() {
  return h("div", { class: "screen screen--wide", id: "conteudo" },
    state.syncMin >= 5 ? staleBanner(atualizarSync) : null,
    header(),
    squad(),
    kpiCards(),
    riscoBlocks(),
    h("div", { class: "grid section", style: { gridTemplateColumns: "1.6fr 1fr", alignItems: "start" } },
      operacaoAgora(),
      aderencia()),
    pontosAtencao(),
    proximosMovimentos());
}
