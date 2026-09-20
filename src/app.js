// ---------------------------------------------------------------------------
// app.js — entry. Monta o shell, orquestra o render e liga os comportamentos
// globais (router, sync, atalhos de teclado). Re-render completo com
// preservação de foco/caret e scroll do main.
// ---------------------------------------------------------------------------

import { h, mount } from "./dom.js";
import { state, subscribe, set, loadPrefs, initialScreen } from "./state.js";
import { startRouter, currentRoute, navigate } from "./router.js";
import { startSync } from "./actions.js";
import { sidebar } from "./components/sidebar.js";
import { drawerView } from "./components/drawer.js";
import { ocorrenciaModal, fechamentoModal } from "./components/modal.js";
import { toastView } from "./components/toast.js";
import { stateBlock } from "./components/primitives.js";

import { screenHoje } from "./screens/hoje.js";
import { screenDim } from "./screens/dim.js";
import { screenCobertura } from "./screens/cobertura.js";
import { screenOcorrencias } from "./screens/ocorrencias.js";
import { screenHandover } from "./screens/handover.js";
import { screenPessoas } from "./screens/pessoas.js";
import { screenEscalas } from "./screens/escalas.js";
import { screenApoio } from "./screens/apoio.js";
import { screenRelatorios } from "./screens/relatorios.js";

const SCREENS = {
  hoje: screenHoje, dim: screenDim, cobertura: screenCobertura,
  ocorrencias: screenOcorrencias, handover: screenHandover, pessoas: screenPessoas,
  escalas: screenEscalas, apoio: screenApoio, relatorios: screenRelatorios,
};

const root = document.getElementById("app");

function renderScreen() {
  if (state.loading) return h("div", { class: "screen screen--wide", id: "conteudo" }, stateBlock("loading"));
  const fn = SCREENS[state.screen] || screenHoje;
  return fn();
}

function view() {
  return h("div", { class: "app" },
    h("button", {
      class: "sidebar__toggle", "aria-label": "Abrir navegação",
      onClick: () => document.body.classList.toggle("nav-open"),
    }, "≡"),
    document.body.classList.contains("nav-open")
      ? h("div", { class: "nav-scrim", onClick: () => document.body.classList.remove("nav-open") })
      : null,
    sidebar(),
    h("main", { class: "main", id: "main-scroll" }, renderScreen()),
    drawerView(),
    ocorrenciaModal(),
    fechamentoModal(),
    toastView(),
  );
}

function render() {
  const active = document.activeElement;
  const activeId = active && active.id ? active.id : null;
  const selStart = active && "selectionStart" in active ? active.selectionStart : null;
  const selEnd = active && "selectionEnd" in active ? active.selectionEnd : null;
  const prevMain = document.getElementById("main-scroll");
  const scrollTop = prevMain ? prevMain.scrollTop : 0;

  mount(root, view());

  const newMain = document.getElementById("main-scroll");
  if (newMain) newMain.scrollTop = scrollTop;
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      if (selStart != null && "setSelectionRange" in el) {
        try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* noop */ }
      }
    }
  }
}

// Atalhos de teclado (ignorados quando o foco está em campo de texto).
function keyHandler(e) {
  const tag = ((e.target || {}).tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    if (e.key === "Escape") e.target.blur();
    return;
  }
  if (e.key === "Escape") {
    set({ drawer: null, modal: false, fechamento: false });
    document.body.classList.remove("nav-open");
    return;
  }
  if (!state.profile.atalhos) return;
  const k = e.key.toLowerCase();
  if (k === "h") navigate("hoje");
  else if (k === "d") navigate("dim");
  else if (k === "c") navigate("cobertura");
  else if (k === "o") navigate("ocorrencias");
  else if (k === "g") navigate("cobertura", { type: "sug" });
  else if (k === "/") { e.preventDefault(); navigate("pessoas"); }
  else if (k === "?") set({ toast: { msg: "H hoje · D DIM · C cobertura · O ocorrências · G próximo gap · Esc fecha", undo: false } });
}

function boot() {
  loadPrefs();
  const routed = currentRoute();
  state.screen = routed || initialScreen();
  startRouter(state.screen);
  startSync();
  window.addEventListener("keydown", keyHandler);
  subscribe(render);
  render();
}

boot();
