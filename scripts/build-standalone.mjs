// ---------------------------------------------------------------------------
// build-standalone.mjs — gera um HTML ÚNICO e autossuficiente
// (central-da-roxinha.html): CSS + JS + fontes (base64) embutidos.
// Abre com duplo clique, sem servidor e sem dependências.
//
// Uso: npm run build
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "central-da-roxinha.html");

// 1) Bundle do app (ESM -> IIFE clássico, roda via file://).
const result = await build({
  entryPoints: [join(ROOT, "src", "app.js")],
  bundle: true,
  format: "iife",
  target: "es2020",
  write: false,
  legalComments: "none",
});
const js = result.outputFiles[0].text;

// 2) CSS combinado (DS tokens + tokens PJ + app).
const cssFiles = ["colors_and_type.css", "pj-tokens.css", "app.css"];
let css = cssFiles.map((f) => readFileSync(join(ROOT, "assets", "css", f), "utf8")).join("\n\n");

// 3) Embute as fontes referenciadas em url("../fonts/NAME.otf") como base64.
css = css.replace(/url\(\s*(["']?)\.\.\/fonts\/([^"')]+)\1\s*\)/g, (m, _q, file) => {
  try {
    const b64 = readFileSync(join(ROOT, "assets", "fonts", file)).toString("base64");
    return `url("data:font/otf;base64,${b64}")`;
  } catch (e) {
    return m; // se faltar, mantém (cai para system-ui)
  }
});

// 4) HTML final.
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%238D0DE3'/%3E%3Crect x='7' y='4' width='10' height='16' rx='2' fill='white'/%3E%3C/svg%3E";
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Central da Roxinha — Operação de atendimento</title>
<meta name="description" content="Cockpit operacional do atendimento da Roxinha: escala, cobertura e operação em um só lugar." />
<link rel="icon" href="${favicon}" />
<style>
${css}
</style>
</head>
<body>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<div id="app"></div>
<script>
${js}
</script>
</body>
</html>
`;

writeFileSync(OUT, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`central-da-roxinha.html gerado (${kb} KB) — abra com duplo clique.`);
