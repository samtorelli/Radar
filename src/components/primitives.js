// ---------------------------------------------------------------------------
// primitives.js — blocos de UI reutilizáveis.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { cycleFilter } from "../actions.js";
import { FILTER_OPTIONS } from "../data.js";
import { initials } from "../util.js";

export function dot(color, size = 8) {
  return h("span", { class: "dot", style: { background: color, width: size + "px", height: size + "px", flex: `0 0 ${size}px` } });
}

export function avatar(nome, opts = {}) {
  const size = opts.size || 30;
  const props = {
    class: "avatar",
    style: { width: size + "px", height: size + "px", fontSize: Math.round(size * 0.38) + "px" },
    "aria-hidden": "true",
  };
  if (opts.foto) {
    props.style.backgroundImage = `url(${opts.foto})`;
    return h("span", props);
  }
  if (opts.color) { props.style.background = opts.color; props.style.color = "#fff"; }
  return h("span", props, opts.text || initials(nome));
}

/** Chip de filtro que cicla valores. */
export function filterChip(key, optsKey, group) {
  const opts = FILTER_OPTIONS[optsKey];
  const val = state.filters[key];
  const on = val !== opts[0];
  return h("button", {
    class: "chip",
    onClick: cycleFilter(key, optsKey),
    "aria-label": `Filtro ${group}: ${val}. Clique para alternar.`,
    style: {
      background: on ? "var(--pj-lavender)" : "#fff",
      color: on ? "var(--pj-purple-deep)" : "var(--pj-ink-1)",
      borderColor: on ? "var(--pj-lavender-300)" : "var(--pj-border-strong)",
    },
  }, h("span", { class: "chip__group" }, group), val);
}

export function statusPill(label, tone, soft) {
  return h("span", { class: "status-pill", style: { background: soft, color: tone } },
    dot(tone, 7), label);
}

export function sectionHead(title, right) {
  return h("div", { class: "section-head" },
    typeof title === "string" ? h("h2", { class: "card-title" }, title) : title,
    right || null);
}

export function kicker(text) {
  return h("div", { class: "kicker" }, text);
}

/** Estados visuais: loading | empty | error | stale */
export function stateBlock(kind, opts = {}) {
  if (kind === "loading") {
    return h("div", { class: "state", role: "status", "aria-live": "polite" },
      h("div", { class: "spinner" }),
      h("div", { class: "state__title" }, opts.title || "Carregando a operação…"),
      h("div", { class: "state__desc" }, opts.desc || "Buscando os dados do turno."));
  }
  if (kind === "error") {
    return h("div", { class: "state", role: "alert" },
      h("div", { style: { fontSize: "26px" } }, "⚠"),
      h("div", { class: "state__title" }, opts.title || "Não foi possível carregar"),
      h("div", { class: "state__desc" }, opts.desc || "Os dados da operação não responderam. Tente novamente."),
      opts.retry ? h("button", { class: "btn btn--primary btn--sm", onClick: opts.retry }, "Tentar de novo") : null);
  }
  if (kind === "empty") {
    return h("div", { class: "state" },
      h("div", { style: { fontSize: "24px" } }, opts.glyph || "—"),
      h("div", { class: "state__title" }, opts.title || "Nada por aqui"),
      h("div", { class: "state__desc" }, opts.desc || ""),
      opts.action || null);
  }
  return null;
}

/** Faixa de "dado desatualizado". */
export function staleBanner(onRefresh) {
  return h("div", {
    class: "card",
    style: { display: "flex", alignItems: "center", gap: "12px", background: "var(--pj-danger-soft)", borderColor: "#F3C9CC", padding: "12px 18px", marginBottom: "16px" },
    role: "status",
  },
    dot("#A8202A", 8),
    h("span", { style: { fontSize: "12.5px", color: "var(--pj-danger)", fontWeight: 600 } }, "Dado desatualizado"),
    h("span", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)", flex: 1 } }, "A sincronização passou de 5 minutos."),
    h("button", { class: "btn btn--secondary btn--sm", onClick: onRefresh }, "Atualizar agora"));
}

/** Etiqueta de proveniência: mock / rascunho. */
export function tag(kind, label) {
  return h("span", { class: "tag tag--" + (kind === "draft" ? "draft" : "mock") }, label || (kind === "draft" ? "Rascunho" : "Dados fictícios"));
}
