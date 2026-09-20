// ---------------------------------------------------------------------------
// router.js — hash-router simples. Rota == tela ativa (state.screen).
// Mantém filtros/contexto ao trocar de tela; navegação sobrevive a reload.
// ---------------------------------------------------------------------------

import { state, set } from "./state.js";
import { NAV } from "./data.js";

const VALID = new Set(NAV.map((n) => n.key));

// Drawer a aplicar no próximo applyRoute. `undefined` = fechar (null);
// qualquer objeto = abrir esse drawer junto com a navegação. Evita a corrida
// em que o hashchange (assíncrono) fecharia um drawer aberto logo após navigate.
let pendingDrawer;

export function currentRoute() {
  const raw = (location.hash || "").replace(/^#\/?/, "").trim();
  return VALID.has(raw) ? raw : null;
}

/** Navega para uma rota. `drawer` opcional abre um drawer junto (ex.: atalho G). */
export function navigate(screen, drawer) {
  if (!VALID.has(screen)) screen = "hoje";
  pendingDrawer = drawer;
  if (location.hash.replace(/^#\/?/, "") === screen) {
    applyRoute(screen); // mesma rota: aplica de imediato
  } else {
    location.hash = "/" + screen; // dispara hashchange -> applyRoute
  }
}

function applyRoute(screen) {
  const drawer = pendingDrawer !== undefined ? pendingDrawer : null;
  pendingDrawer = undefined;
  set({ screen, drawer });
}

export function startRouter(fallback) {
  const onHash = () => {
    const r = currentRoute();
    applyRoute(r || fallback || "hoje");
  };
  window.addEventListener("hashchange", onHash);
  // rota inicial: hash da URL tem prioridade; senão, preferência do perfil
  const initial = currentRoute();
  if (initial) {
    state.screen = initial;
  } else if (fallback) {
    state.screen = fallback;
    location.replace("#/" + fallback);
  }
}
