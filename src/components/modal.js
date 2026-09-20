// ---------------------------------------------------------------------------
// modal.js — modal de "Registrar ocorrência" e diálogo de fechamento do DIM.
// Fecha por Esc, clique no scrim e botão. Foco inicial no primeiro campo.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import {
  closeModal, salvarRascunho, publicarOcorrencia, setImpacto,
  closeFechamento, confirmFechamento,
} from "../actions.js";
import { PEOPLE, FILTER_OPTIONS, DATA_LABEL } from "../data.js";
import { tag } from "./primitives.js";

function scrim(onClose) {
  return h("div", { class: "scrim", onClick: onClose, "aria-hidden": "true" });
}

function impactoChip(label) {
  const on = state.impacto === label;
  return h("button", {
    class: "chip", type: "button", onClick: setImpacto(label),
    style: {
      background: on ? "var(--pj-lavender)" : "#fff",
      color: on ? "var(--pj-purple-deep)" : "var(--pj-ink-1)",
      borderColor: on ? "var(--pj-lavender-300)" : "var(--pj-border-strong)",
    },
  }, label);
}

function field(labelText, control) {
  return h("label", { class: "field" },
    h("span", { class: "field__label" }, labelText), control);
}

export function ocorrenciaModal() {
  if (!state.modal) return null;
  const pessoas = PEOPLE.map((p) => p.nome).concat(["Fila de chat", "CRM", "Integração da maquininha"]);
  const categorias = ["Atraso", "Ausência", "Falha de sistema", "Escalonamento", "Troca de turno"];
  const responsaveis = ["Sem responsável"].concat(FILTER_OPTIONS.resp.slice(1));

  return h("div", { class: "modal-wrap", role: "dialog", "aria-modal": "true", "aria-label": "Registrar ocorrência" },
    scrim(closeModal),
    h("div", { class: "modal", style: { position: "relative", zIndex: 1 } },
      h("div", { class: "modal__head" },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
          h("div", {},
            h("div", { class: "kicker" }, "Nova ocorrência"),
            h("h2", { class: "card-title", style: { marginTop: "4px", fontSize: "21px" } }, "Registrar ocorrência"),
          ),
          h("button", { class: "icon-btn", onClick: closeModal, "aria-label": "Fechar" }, "×"),
        ),
        h("div", { style: { marginTop: "6px" } }, tag("mock", "Sem backend — dados fictícios")),
      ),
      h("div", { class: "modal__body" },
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" } },
          field("Pessoa ou sistema", h("select", { id: "oc-pessoa", class: "select", ref: (n) => setTimeout(() => n.focus(), 30) },
            pessoas.map((p) => h("option", {}, p)))),
          field("Categoria", h("select", { id: "oc-categoria", class: "select" }, categorias.map((c) => h("option", {}, c)))),
          field("Horário", h("input", { id: "oc-hora", class: "input", type: "time", value: "14:00" })),
          field("Responsável", h("select", { id: "oc-resp", class: "select" }, responsaveis.map((r) => h("option", {}, r)))),
        ),
        field("Descrição", h("textarea", { id: "oc-desc", class: "textarea", rows: "3", placeholder: "O que aconteceu, com que impacto e o que já foi feito." })),
        h("div", { class: "field" },
          h("span", { class: "field__label" }, "Impacto"),
          h("div", { style: { display: "flex", gap: "8px" } }, ["Baixo", "Médio", "Alto"].map(impactoChip)),
        ),
        h("div", { class: "meta" }, DATA_LABEL + " · turno da manhã"),
      ),
      h("div", { class: "modal__foot" },
        h("button", { class: "btn btn--secondary", onClick: salvarRascunho }, "Salvar rascunho"),
        h("button", { class: "btn btn--primary", onClick: publicarOcorrencia }, "Publicar"),
      ),
    ),
  );
}

export function fechamentoModal() {
  if (!state.fechamento) return null;
  return h("div", { class: "modal-wrap", role: "dialog", "aria-modal": "true", "aria-label": "Validar fechamento do DIM" },
    scrim(closeFechamento),
    h("div", { class: "modal", style: { position: "relative", zIndex: 1, width: "520px" } },
      h("div", { class: "modal__head" },
        h("div", { class: "kicker" }, "Fechamento"),
        h("h2", { class: "card-title", style: { marginTop: "4px", fontSize: "21px" } }, "Validar fechamento do DIM"),
      ),
      h("div", { class: "modal__body" },
        h("p", { style: { fontSize: "13px", color: "var(--pj-ink-2)", lineHeight: 1.5, margin: "0 0 12px" } },
          "Há 2 alterações registradas hoje aguardando validação. Ao validar, o DIM do turno da manhã é fechado e as alterações passam a valer para a passagem."),
        h("ul", { style: { margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "var(--pj-ink-2)", lineHeight: 1.7 } },
          h("li", {}, "Pausa de Carla remanejada para 10:00"),
          h("li", {}, "Cobertura 14:00–15:00 pendente de alocação"),
        ),
      ),
      h("div", { class: "modal__foot" },
        h("button", { class: "btn btn--secondary", onClick: closeFechamento }, "Cancelar"),
        h("button", { class: "btn btn--primary", onClick: confirmFechamento }, "Validar fechamento"),
      ),
    ),
  );
}
