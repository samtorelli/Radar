// ---------------------------------------------------------------------------
// toast.js — feedback flutuante. Ações reversíveis exibem "Desfazer".
// ---------------------------------------------------------------------------

import { h } from "../dom.js";
import { state } from "../state.js";
import { doUndo } from "../actions.js";

export function toastView() {
  const t = state.toast;
  if (!t) return null;
  return h("div", { class: "toast", role: "status", "aria-live": "polite" },
    h("span", {}, t.msg),
    t.undo ? h("button", { class: "toast__undo", onClick: doUndo }, "Desfazer") : null,
  );
}
