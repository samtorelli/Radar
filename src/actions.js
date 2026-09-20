// ---------------------------------------------------------------------------
// actions.js — comportamentos da aplicação. Toda ação relevante dá retorno
// visual (toast, atualização de estado). Ações reversíveis expõem "Desfazer".
// ---------------------------------------------------------------------------

import { state, set, setProfile, setFilter, persist, runtime } from "./state.js";
import { navigate } from "./router.js";
import { hourly, pattern, firstName } from "./util.js";
import { FILTER_OPTIONS } from "./data.js";

// ---- Toast + desfazer -----------------------------------------------------
export function toast(msg, undo) {
  clearTimeout(runtime.toastTimer);
  runtime.undo = undo || null;
  set({ toast: { msg, undo: !!undo } });
  runtime.toastTimer = setTimeout(() => set({ toast: null }), undo ? 10000 : 2600);
}

export function doUndo() {
  clearTimeout(runtime.toastTimer);
  if (runtime.undo) runtime.undo();
  runtime.undo = null;
  set({ toast: { msg: "Alteração desfeita", undo: false } });
  runtime.toastTimer = setTimeout(() => set({ toast: null }), 2200);
}

// ---- Navegação / drawers / overlays ---------------------------------------
export const go = (screen) => () => navigate(screen);
export const openDrawer = (drawer) => set({ drawer });
export const closeDrawer = () => set({ drawer: null });
export const openPerson = (person) => () => set({ drawer: { type: "person", p: person } });
export const openSugestoes = () => set({ drawer: { type: "sug" } });
export const openPerfil = () => set({ drawer: { type: "perfil" } });
export const openModal = () => set({ modal: true });
export const closeModal = () => set({ modal: false });
export const openFechamento = () => set({ fechamento: true });
export const closeFechamento = () => set({ fechamento: false });

export function confirmFechamento() {
  set({ fechamento: false });
  toast("Fechamento do DIM validado");
}

function readOcForm() {
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
  const toneByImpacto = { Baixo: "#2940A8", "Médio": "#8C5A0E", Alto: "#A8202A" };
  const softByImpacto = { Baixo: "#E6ECFE", "Médio": "#FBEFD0", Alto: "#FDE7E7" };
  const resp = val("oc-resp");
  return {
    tipo: val("oc-categoria") || "Ocorrência",
    tone: toneByImpacto[state.impacto] || "#8C5A0E",
    soft: softByImpacto[state.impacto] || "#FBEFD0",
    pessoa: val("oc-pessoa") || "—",
    hora: val("oc-hora") || "agora",
    desc: val("oc-desc") || "Sem descrição informada.",
    responsavel: resp && resp !== "Sem responsável" ? resp : "",
    update: "há instantes",
    novo: true,
  };
}

export function salvarRascunho() {
  set({ modal: false });
  toast("Ocorrência salva como rascunho");
}

export function publicarOcorrencia() {
  const oc = readOcForm();
  set((s) => ({ modal: false, ocList: [oc, ...s.ocList] }));
  toast(oc.responsavel ? "Ocorrência registrada e atribuída" : "Ocorrência registrada · sem responsável");
}

export const setImpacto = (label) => () => set({ impacto: label });

// ---- Filtros (ciclam entre valores) ---------------------------------------
export function cycleFilter(key, optsKey) {
  return () => {
    const opts = FILTER_OPTIONS[optsKey];
    const cur = state.filters[key];
    const i = opts.indexOf(cur);
    setFilter(key, opts[(i + 1) % opts.length]);
  };
}

export function setQuery(e) {
  set({ query: e.target.value });
}

// ---- DIM: seleção múltipla + ações em lote --------------------------------
export const toggleSel = (name) => (e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  set((s) => ({ sel: s.sel.includes(name) ? s.sel.filter((n) => n !== name) : s.sel.concat(name) }));
};

export const bulk = (label) => () => {
  const prev = state.sel;
  set({ sel: [] });
  toast(label + " para " + prev.length + " pessoas", () => set({ sel: prev }));
};

export const clearSel = () => set({ sel: [] });

// ---- DIM: arrastar pausa na timeline individual ---------------------------
export function movePausa(person, fromH, toH) {
  const pat = pattern(person).split("");
  const hour = hourly(pat.join(""));
  if (hour[fromH] !== "p" || fromH === toH) return;
  if (["f", "v", "x"].includes(hour[toH])) {
    toast("Fora do horário previsto dessa pessoa");
    return;
  }
  const prev = pat.join("");
  for (let i = 0; i < 2; i++) {
    if (pat[fromH * 2 + i] === "p") { pat[fromH * 2 + i] = "a"; pat[toH * 2 + i] = "p"; }
  }
  const next = pat.join("");
  set((s) => ({ shift: { ...s.shift, [person.nome]: next } }));
  toast("Pausa de " + firstName(person.nome) + " remanejada",
    () => set((s) => ({ shift: { ...s.shift, [person.nome]: prev } })));
}

// ---- Handover: checklist + resumo -----------------------------------------
export const toggleCheck = (id) => () =>
  set((s) => ({ checks: s.checks.includes(id) ? s.checks.filter((c) => c !== id) : s.checks.concat(id) }));

export function gerarResumo() {
  set({ resumo: true });
  toast("Resumo gerado como rascunho");
}

export const descartarResumo = () => set({ resumo: false });
export const publicarPassagem = () => toast("Passagem publicada para o turno da tarde");

// ---- Sincronização --------------------------------------------------------
export function atualizarSync() {
  set({ syncMin: 0 });
  toast("Dados atualizados agora");
}

export function startSync() {
  clearInterval(runtime.syncTimer);
  runtime.syncTimer = setInterval(() => set((s) => ({ syncMin: s.syncMin + 1 })), 45000);
}

// ---- Perfil ---------------------------------------------------------------
export { setProfile };

export function setFoto(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = 160, cv = document.createElement("canvas");
      cv.width = s; cv.height = s;
      const k = Math.min(img.width, img.height);
      cv.getContext("2d").drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, s, s);
      setProfile({ foto: cv.toDataURL("image/jpeg", 0.82) });
      toast("Foto de perfil atualizada");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export function removerFoto() {
  if (state.profile.foto) setProfile({ foto: "" });
}

export function savePrefs() {
  persist();
  toast("Preferências salvas neste navegador");
}

// ---- Genéricos ------------------------------------------------------------
export const notify = (msg, undo) => () => toast(msg, undo);
export const openAdmin = () => toast("Administração disponível apenas para perfis Admin");

// ---- Estados de demonstração (loading / erro / atualizado) ----------------
export function simulateReload() {
  set({ loading: true, dataError: false });
  setTimeout(() => { set({ loading: false, syncMin: 0 }); toast("Operação recarregada"); }, 900);
}

export function simulateError() {
  set({ dataError: true });
}

export function clearError() {
  set({ dataError: false });
  simulateReload();
}
