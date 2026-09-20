// ---------------------------------------------------------------------------
// drawer.js — painel lateral (440px). Tipos: person, sug, alert, oc, perfil.
// Fecha por scrim, × e Esc (Esc tratado no app.js). Arrastar pausa na timeline
// individual do person.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state, setProfile, runtime } from "../state.js";
import {
  closeDrawer, toast, movePausa, setFoto, removerFoto, savePrefs,
} from "../actions.js";
import {
  SUGESTOES, PERSON_HISTORY, ALERT_STEPS, OC_UPDATES, TIMELINE, CODE,
} from "../data.js";
import { slots, cells, pattern, initials } from "../util.js";
import { avatar, dot, statusPill, tag } from "./primitives.js";

function shell(title, kicker, subtitle, ctaLabel, onCta, body) {
  return [
    h("div", { class: "scrim", onClick: closeDrawer, "aria-hidden": "true" }),
    h("aside", { class: "drawer", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "drawer__head" },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" } },
          h("div", { style: { minWidth: 0 } },
            h("div", { class: "kicker" }, kicker),
            h("h2", { class: "card-title", style: { marginTop: "4px", fontSize: "22px" } }, title || "—"),
            subtitle ? h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-3)", marginTop: "3px" } }, subtitle) : null,
          ),
          h("button", { class: "icon-btn", onClick: closeDrawer, "aria-label": "Fechar" }, "×"),
        ),
      ),
      h("div", { class: "drawer__body" }, body),
      onCta ? h("div", { class: "drawer__foot" },
        h("button", { class: "btn btn--secondary", onClick: closeDrawer, style: { flex: "0 0 auto" } }, "Fechar"),
        h("button", { class: "btn btn--primary", onClick: onCta, style: { flex: 1, justifyContent: "center" } }, ctaLabel),
      ) : null,
    ),
  ];
}

function metaGrid(rows) {
  return h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "4px 0 18px" } },
    rows.map((r) => h("div", {},
      h("div", { class: "col-label" }, r.label),
      h("div", { style: { fontSize: "13px", fontWeight: 600, marginTop: "3px" } }, r.value))));
}

// ---- Person ---------------------------------------------------------------
function personDrawer(person) {
  const s = slots();
  const code = CODE[(pattern(person)[3]) || "f"] || "fo";
  const cs = cells(pattern(person), s);
  const timelineCells = cs.map((c, i) => {
    const draggable = pattern(person)[i * 2] === "p" || pattern(person)[i * 2 + 1] === "p";
    return h("div", {
      class: "tl__cell",
      draggable,
      title: c.title + (draggable ? " · arraste para remanejar" : ""),
      style: { background: c.bg, border: `1px solid ${c.border}`, cursor: draggable ? "grab" : "default" },
      onDragstart: (e) => { runtime.dragFrom = i; if (e.dataTransfer) e.dataTransfer.effectAllowed = "move"; },
      onDragover: (e) => e.preventDefault(),
      onDrop: (e) => { e.preventDefault(); if (runtime.dragFrom != null) movePausa(person, runtime.dragFrom, i); runtime.dragFrom = null; },
    });
  });

  const body = [
    metaGrid([
      { label: "Horário", value: person.escala },
      { label: "Cluster", value: person.cluster },
      { label: "Líder", value: person.lider },
      { label: "Status atual", value: TIMELINE[code].label },
    ]),
    h("div", { class: "col-label", style: { marginBottom: "6px" } }, "Timeline de hoje · arraste a pausa"),
    h("div", { class: "tl tl--tall", style: { marginBottom: "6px" } }, timelineCells),
    h("div", { class: "meta", style: { marginBottom: "18px" } }, "08:00 → 20:00 · soltar fora do horário previsto é recusado"),
    h("div", { class: "col-label", style: { marginBottom: "8px" } }, "Histórico de alterações"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" } },
      PERSON_HISTORY.map((it) => h("div", { style: { display: "flex", gap: "10px" } },
        h("span", { style: { fontSize: "11px", color: "var(--pj-ink-4)", flex: "0 0 46px" } }, it.time),
        h("div", {},
          h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-1)" } }, it.text),
          h("div", { class: "meta" }, it.author))))),
    h("label", { class: "field" },
      h("span", { class: "field__label" }, "Comentário"),
      h("textarea", { class: "textarea", rows: "2", placeholder: "Registrar um comentário (fato, não julgamento)" })),
  ];
  return shell(person.nome, "Perfil operacional", `${person.cluster} · ${person.lider}`, "Editar alocação",
    () => { closeDrawer(); toast("Alteração registrada no DIM", () => toast("Alteração revertida")); }, body);
}

// ---- Sugestões de cobertura ----------------------------------------------
function sugDrawer() {
  const body = [
    h("div", { class: "card", style: { background: "var(--pj-danger-soft)", borderColor: "#F3C9CC", marginBottom: "16px" } },
      h("div", { style: { fontSize: "13px", fontWeight: 600, color: "var(--pj-danger)" } }, "Faltam 3 pessoas às 14:00 no Chat"),
      h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)", marginTop: "4px" } }, "A sugestão não é só uma lista: cada opção mostra o impacto da escolha.")),
    tag("mock"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" } },
      SUGESTOES.map((sug) => h("div", { class: "card card-hover" },
        h("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
          avatar(sug.nome, { size: 34, color: "#ECDFFF" }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { style: { fontSize: "13.5px", fontWeight: 600 } }, sug.nome),
            h("div", { class: "meta" }, `${sug.cluster} · ${sug.horario}`)),
          h("span", { class: "status-pill", style: { background: sug.soft, color: sug.tone } }, `Compat. ${sug.compat}`)),
        h("div", { style: { display: "flex", gap: "8px", marginTop: "12px", alignItems: "flex-start" } },
          dot(sug.conflitoTone, 7),
          h("div", { style: { fontSize: "12px", color: "var(--pj-ink-2)" } }, sug.conflito)),
        h("div", { style: { display: "flex", gap: "8px", marginTop: "8px", alignItems: "flex-start", padding: "10px 12px", background: "var(--pj-surface-muted)", borderRadius: "10px" } },
          h("span", { class: "col-label", style: { flex: "0 0 auto" } }, "Custo"),
          h("div", { style: { fontSize: "12px", color: sug.custoTone, fontWeight: 500 } }, sug.custo)),
        h("button", { class: "btn btn--primary btn--sm", style: { marginTop: "12px", width: "100%", justifyContent: "center" },
          onClick: () => { closeDrawer(); toast(sug.nome + " selecionada para cobertura das 14:00"); } },
          "Selecionar para cobertura")))),
  ];
  return shell("14:00 – 15:00", "Opções de cobertura", "Cluster Chat · faltam 3 pessoas", null, null, body);
}

// ---- Alerta ---------------------------------------------------------------
function alertDrawer(d) {
  const body = [
    h("div", { class: "card", style: { background: d.soft || "var(--pj-surface-muted)", borderColor: "transparent", marginBottom: "16px" } },
      h("div", { style: { fontSize: "13px", color: "var(--pj-ink-1)", lineHeight: 1.5 } }, d.desc || "")),
    h("div", { class: "col-label", style: { marginBottom: "10px" } }, "Passos sugeridos"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      ALERT_STEPS.map((st) => h("div", { style: { display: "flex", gap: "12px", alignItems: "flex-start" } },
        h("span", { style: { width: "24px", height: "24px", borderRadius: "50%", background: "var(--pj-lavender)", color: "var(--pj-purple-deep)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flex: "0 0 24px" } }, String(st.n)),
        h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)", lineHeight: 1.5, paddingTop: "2px" } }, st.text)))),
  ];
  return shell(d.title, "Ponto de atenção", d.subtitle || "", "Marcar como resolvido",
    () => { closeDrawer(); toast("Ponto de atenção marcado como resolvido"); }, body);
}

// ---- Ocorrência -----------------------------------------------------------
function ocDrawer(d) {
  const body = [
    metaGrid([
      { label: "Tipo", value: d.tipo || "—" },
      { label: "Horário", value: d.hora || "—" },
      { label: "Responsável", value: d.responsavel || "—" },
      { label: "Impacto", value: "Médio" },
    ]),
    h("div", { class: "card", style: { background: "var(--pj-surface-muted)", borderColor: "transparent", marginBottom: "16px" } },
      h("div", { style: { fontSize: "13px", color: "var(--pj-ink-1)", lineHeight: 1.5 } }, d.desc || "")),
    h("div", { class: "col-label", style: { marginBottom: "10px" } }, "Atualizações"),
    h("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
      OC_UPDATES.map((u) => h("div", { style: { display: "flex", gap: "10px" } },
        h("span", { style: { fontSize: "11px", color: "var(--pj-ink-4)", flex: "0 0 46px" } }, u.time),
        h("div", { style: { fontSize: "12.5px", color: "var(--pj-ink-2)" } }, u.text)))),
  ];
  return shell(d.pessoa, "Ocorrência", `${d.tipo || ""} · ${d.hora || ""}`, "Atualizar ocorrência",
    () => { closeDrawer(); toast("Ocorrência atualizada"); }, body);
}

// ---- Perfil ---------------------------------------------------------------
function optionRow(label, opts, current, onPick) {
  return h("div", { class: "field" },
    h("span", { class: "field__label" }, label),
    h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
      opts.map((o) => {
        const on = current === o;
        return h("button", { class: "chip", onClick: () => onPick(o),
          style: { background: on ? "var(--pj-lavender)" : "#fff", color: on ? "var(--pj-purple-deep)" : "var(--pj-ink-2)", borderColor: on ? "var(--pj-lavender-300)" : "var(--pj-border-strong)" } }, o);
      })));
}

function perfilDrawer() {
  const p = state.profile;
  const cores = ["#8D0DE3", "#6E08B3", "#1E002F", "#4E0683"];
  const body = [
    h("div", { style: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" } },
      avatar(p.nome, { size: 56, foto: p.foto, color: p.cor }),
      h("div", {},
        h("label", { class: "btn btn--secondary btn--sm", style: { display: "inline-block" } }, "Trocar foto",
          h("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: setFoto })),
        p.foto ? h("button", { class: "btn btn--ghost btn--sm", onClick: removerFoto }, "Remover") : null)),
    h("label", { class: "field" },
      h("span", { class: "field__label" }, "Nome"),
      h("input", { class: "input", value: p.nome, onInput: (e) => setProfile({ nome: e.target.value }) })),
    h("label", { class: "field" },
      h("span", { class: "field__label" }, "Pronomes"),
      h("input", { class: "input", value: p.pronomes, onInput: (e) => setProfile({ pronomes: e.target.value }) })),
    h("label", { class: "field" },
      h("span", { class: "field__label" }, "Saudação"),
      h("input", { class: "input", value: p.saudacao, onInput: (e) => setProfile({ saudacao: e.target.value }) })),
    h("div", { class: "field" },
      h("span", { class: "field__label" }, "Cor do avatar"),
      h("div", { style: { display: "flex", gap: "10px" } },
        cores.map((c) => h("button", { onClick: () => setProfile({ cor: c }), "aria-label": "Cor " + c,
          style: { width: "28px", height: "28px", borderRadius: "50%", background: c, border: `2px solid ${p.cor === c ? "var(--pj-ink-1)" : "transparent"}` } })))),
    optionRow("Tela inicial", ["Hoje", "DIM", "Cobertura", "Ocorrências", "Pessoas"], p.tela, (t) => setProfile({ tela: t })),
    optionRow("Densidade da tabela", ["Confortável", "Compacta"], p.densidade, (d) => setProfile({ densidade: d })),
    h("div", { class: "field", style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
      h("span", { class: "field__label", style: { marginBottom: 0 } }, "Atalhos de teclado"),
      h("button", { role: "switch", "aria-checked": String(p.atalhos), onClick: () => setProfile({ atalhos: !p.atalhos }),
        style: { width: "44px", height: "24px", borderRadius: "999px", background: p.atalhos ? "var(--pj-purple)" : "#D7D4CC", position: "relative", transition: "background 180ms" } },
        h("span", { style: { position: "absolute", top: "2px", left: p.atalhos ? "22px" : "2px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 180ms" } }))),
    h("div", { class: "meta" }, "Preferências ficam só neste navegador (localStorage)."),
  ];
  return shell(p.nome, "Meu perfil", `Perfil Ops · ${p.pronomes}`, "Salvar preferências",
    () => { closeDrawer(); savePrefs(); }, body);
}

export function drawerView() {
  const d = state.drawer;
  if (!d) return null;
  if (d.type === "person") return personDrawer(d.p);
  if (d.type === "sug") return sugDrawer();
  if (d.type === "alert") return alertDrawer(d);
  if (d.type === "oc") return ocDrawer(d);
  if (d.type === "perfil") return perfilDrawer();
  return null;
}
