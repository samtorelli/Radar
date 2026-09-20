// ---------------------------------------------------------------------------
// state.js — store de estado global (observável) + persistência de preferências.
// Persiste apenas { profile, filters } em localStorage (chave roxinha.prefs),
// espelhando a decisão do handoff. Nenhum dado operacional é persistido.
// ---------------------------------------------------------------------------

const PREFS_KEY = "roxinha.prefs";

const listeners = new Set();

function defaultState() {
  return {
    screen: "hoje",
    dimTab: "pessoa",
    filters: {
      cluster: "Todos", lider: "Todos", status: "Todos", frente: "Todas",
      tipo: "Todos", resp: "Todos", horario: "Todos", escala: "Todas",
    },
    query: "",
    drawer: null,        // { type, ...payload }
    modal: false,        // registrar ocorrência
    fechamento: false,   // validar fechamento do DIM
    toast: null,         // { msg, undo }
    resumo: false,       // rascunho de handover gerado
    impacto: "Médio",
    horizonte: "Próximas 4h",
    sel: [],             // nomes selecionados (ação em lote)
    syncMin: 2,
    checks: [],          // itens herdados marcados
    ocList: [],          // ocorrências criadas na sessão (mock, não persiste)
    shift: {},           // timelines alteradas por pessoa (nome -> string 24)
    dataError: false,    // simulação de estado de erro
    loading: false,      // simulação de estado de carregamento
    profile: {
      nome: "Samuel Moura", pronomes: "ele/dele", cor: "#8D0DE3",
      saudacao: "Bom dia, Samuel", tela: "Hoje", densidade: "Compacta",
      atalhos: true, foto: "",
    },
  };
}

export const state = defaultState();

// Runtime interno (timers/undo) — fora do estado observável.
export const runtime = { undo: null, toastTimer: null, syncTimer: null, dragFrom: null };

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emit() {
  listeners.forEach((fn) => fn(state));
}

/** Atualiza o estado (merge raso) e notifica. */
export function set(patch) {
  Object.assign(state, typeof patch === "function" ? patch(state) : patch);
  emit();
}

export function setProfile(patch) {
  state.profile = { ...state.profile, ...patch };
  persist();
  emit();
}

export function setFilter(key, value) {
  state.filters = { ...state.filters, [key]: value };
  persist();
  emit();
}

export function persist() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      profile: state.profile,
      filters: state.filters,
    }));
  } catch (e) { /* modo privado / storage indisponível */ }
}

const TELA_MAP = { Hoje: "hoje", DIM: "dim", Cobertura: "cobertura", "Ocorrências": "ocorrencias", Pessoas: "pessoas" };

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) || {};
    if (p.profile) state.profile = { ...state.profile, ...p.profile };
    if (p.filters) state.filters = { ...state.filters, ...p.filters };
  } catch (e) { /* ignora prefs corrompidas */ }
}

/** Tela inicial preferida do perfil (fallback: hoje). */
export function initialScreen() {
  return TELA_MAP[state.profile.tela] || "hoje";
}
