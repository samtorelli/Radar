// ---------------------------------------------------------------------------
// util.js — helpers puros: timeline, iniciais, slots, cobertura.
// ---------------------------------------------------------------------------

import { CODE, TIMELINE } from "./data.js";
import { state } from "./state.js";

/** 12 slots de 1 h: 08:00 … 19:00. */
export function slots() {
  const out = [];
  for (let i = 0; i < 12; i++) out.push(String(8 + i).padStart(2, "0") + ":00");
  return out;
}

/** Rótulo do fim do slot i (o último termina 20:00). */
export function slotEnd(i, s) {
  return i < 11 ? s[i + 1] : "20:00";
}

/** Colapsa uma timeline de 24 chars (30min) para 12 chars (1h),
 * escolhendo o código de maior prioridade dentro da hora. */
export function hourly(pat) {
  const p = (pat + "ffffffffffffffffffffffff").slice(0, 24);
  const rank = ["x", "v", "?", "p", "t", "c", "a", "f"]; // prioridade de exibição
  const out = [];
  for (let h = 0; h < 12; h++) {
    const a = p[h * 2], b = p[h * 2 + 1];
    out.push(rank.indexOf(a) <= rank.indexOf(b) ? a : b);
  }
  return out.join("");
}

/** Timeline efetiva da pessoa (considera alterações do turno em state.shift). */
export function pattern(person) {
  return state.shift[person.nome] || person.tl;
}

/** Células de exibição (bg/border/title) de uma timeline. */
export function cells(pat, s) {
  return hourly(pat).split("").map((ch, i) => {
    const c = TIMELINE[CODE[ch] || "fo"];
    return {
      bg: c.bg, border: c.border, label: c.label,
      title: s[i] + "–" + slotEnd(i, s) + " · " + c.label,
    };
  });
}

export function initials(nome) {
  return nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function firstName(nome) {
  return nome.split(" ")[0];
}

/** Código de status "agora" (slot NOW) de uma pessoa. */
export function statusNow(person, nowSlot) {
  const pat = pattern(person);
  return CODE[hourly(pat)[nowSlot] || "f"] || "fo";
}
