// ---------------------------------------------------------------------------
// icons.js — ícones. O placeholder da maquininha é EXPLORATÓRIO: não é logo
// oficial da Roxinha e deve ser trocado quando a identidade for definida.
// UI usa formas geométricas / glyphs, conforme o handoff.
// ---------------------------------------------------------------------------

import { h } from "../dom.js";

// Placeholder exploratório da maquininha (SVG inline, 24x24).
export function machineMark() {
  const r = (x, y, w, hh, rad, fill) => h("rect", { x, y, width: w, height: hh, rx: rad, fill });
  return h("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true" },
    r("6.2", "2.6", "11.6", "18.8", "2.4", "#FFFFFF"),
    r("8.2", "4.6", "7.6", "4.8", "1", "#8D0DE3"),
    r("8.2", "11.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("11", "11.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("13.8", "11.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("8.2", "14.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("11", "14.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("13.8", "14.4", "2", "1.9", "0.5", "#8D0DE3"),
    r("8.2", "17.4", "7.6", "1.9", "0.9", "#CBA5FD"),
    h("path", { d: "M6.2 5.2H3.4a1.2 1.2 0 0 0-1.2 1.2v1.2a1.2 1.2 0 0 0 1.2 1.2h2.8", fill: "#CBA5FD" }),
  );
}
