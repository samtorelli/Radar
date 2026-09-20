// ---------------------------------------------------------------------------
// sidebar.js — navegação lateral (~256px). Item ativo: fundo branco, texto
// roxo, barra lateral roxa. Badges numéricos em Cobertura, Ocorrências e Apoio.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { NAV } from "../data.js";
import { go, atualizarSync, openPerfil, openAdmin } from "../actions.js";
import { navigate } from "../router.js";
import { machineMark } from "./icons.js";
import { avatar } from "./primitives.js";
import { initials } from "../util.js";

function navItem(item) {
  const active = state.screen === item.key;
  return h("button", {
    class: "nav__item",
    "aria-current": active ? "page" : null,
    onClick: () => { navigate(item.key); document.body.classList.remove("nav-open"); },
  },
    h("span", { class: "nav__bar" }),
    h("span", { class: "nav__label" }, item.label),
    item.badge ? h("span", { class: "nav__badge", "aria-label": `${item.badge} pendências` }, String(item.badge)) : null,
  );
}

export function sidebar() {
  const p = state.profile;
  const stale = state.syncMin >= 5;

  return h("aside", { class: "sidebar", "aria-label": "Navegação principal" },
    h("div", { class: "sidebar__brand" },
      h("div", { class: "sidebar__mark", title: "Placeholder exploratório — maquininha (não é logo oficial)" }, machineMark()),
      h("div", {},
        h("div", { class: "sidebar__title" }, "Central da ", h("span", {}, "Roxinha")),
        h("div", { class: "sidebar__subtitle" }, "Operação de atendimento"),
      ),
    ),

    h("nav", { class: "nav" }, NAV.map(navItem)),

    h("div", { class: "sidebar__footer" },
      h("button", { class: "sync", onClick: atualizarSync, title: "Clique para sincronizar agora" },
        h("span", { class: "sync__dot", style: { background: stale ? "#A8202A" : "#6FB344" } }),
        h("span", { style: { color: stale ? "#A8202A" : "var(--pj-ink-3)", fontWeight: stale ? 600 : 400 } },
          stale ? "Dado desatualizado" : `Dados sincronizados há ${state.syncMin} min`),
      ),
      h("button", { class: "user-block", onClick: openPerfil },
        avatar(p.nome, { size: 30, foto: p.foto, color: p.cor }),
        h("div", { style: { minWidth: 0 } },
          h("div", { style: { fontSize: "12.5px", fontWeight: 600, color: "var(--pj-ink-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, p.nome),
          h("div", { style: { fontSize: "11px", color: "var(--pj-ink-3)" } }, `Perfil: Ops · ${p.pronomes}`),
        ),
      ),
      h("a", { class: "admin-link", href: "#", onClick: (e) => { e.preventDefault(); openAdmin(); } }, "Administração"),
    ),
  );
}
