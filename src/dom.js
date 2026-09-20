// ---------------------------------------------------------------------------
// dom.js — mini runtime de DOM (substitui o support.js do protótipo).
// Hyperscript enxuto: cria nós reais, aceita handlers e estilos como objeto.
// Não usa innerHTML para dados dinâmicos (evita XSS).
// ---------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set([
  "svg", "path", "rect", "circle", "line", "polyline", "polygon", "g", "defs", "text",
]);

function applyStyle(node, style) {
  if (style == null) return;
  if (typeof style === "string") {
    node.setAttribute("style", style);
    return;
  }
  for (const key in style) {
    const val = style[key];
    if (val == null || val === false) continue;
    node.style.setProperty(camelToKebab(key), String(val));
  }
}

function camelToKebab(s) {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function appendChild(node, child) {
  if (child == null || child === false || child === true) return;
  if (Array.isArray(child)) {
    child.forEach((c) => appendChild(node, c));
    return;
  }
  if (child instanceof Node) {
    node.appendChild(child);
    return;
  }
  node.appendChild(document.createTextNode(String(child)));
}

/**
 * h(tag, props, ...children)
 * props: { style, class/className, onClick, onInput, ..., dataset, html, ...attrs }
 * Use `html` apenas para conteúdo estático confiável (ícones SVG string).
 */
export function h(tag, props, ...children) {
  const isSvg = SVG_TAGS.has(tag);
  const node = isSvg
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);

  const p = props || {};
  for (const key in p) {
    const val = p[key];
    if (val == null) continue;
    if (key === "style") {
      applyStyle(node, val);
    } else if (key === "class" || key === "className") {
      node.setAttribute("class", val);
    } else if (key === "dataset") {
      for (const dk in val) node.dataset[dk] = val[dk];
    } else if (key === "html") {
      node.innerHTML = val; // conteúdo estático confiável apenas
    } else if (key === "ref" && typeof val === "function") {
      val(node);
    } else if (key.startsWith("on") && typeof val === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === "draggable") {
      node.setAttribute("draggable", val ? "true" : "false");
    } else if (typeof val === "boolean") {
      if (val) node.setAttribute(key, "");
    } else {
      if (isSvg) node.setAttribute(key, val);
      else node.setAttribute(key, val);
    }
  }

  children.forEach((c) => appendChild(node, c));
  return node;
}

/** Limpa e monta um (ou vários) nó dentro de um container. */
export function mount(container, node) {
  container.textContent = "";
  appendChild(container, node);
  return container;
}

/** Escapa texto para uso em `html:` quando necessário. */
export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Fragmento a partir de uma lista. */
export function frag(children) {
  const f = document.createDocumentFragment();
  appendChild(f, children);
  return f;
}
