// ---------------------------------------------------------------------------
// validate.mjs — validação sem build. Checa a sintaxe de todo o JS (node --check),
// confirma que o grafo de módulos importa sem erros e que os assets essenciais
// existem. Sai com código != 0 em qualquer falha.
// ---------------------------------------------------------------------------

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let errors = 0;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "legacy") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (extname(full) === ".js" || extname(full) === ".mjs") out.push(full);
  }
  return out;
}

// 1) Sintaxe de cada arquivo JS.
const files = walk(join(ROOT, "src")).concat([join(ROOT, "server.js"), join(ROOT, "scripts", "validate.mjs")]);
for (const f of files) {
  try {
    execFileSync(process.execPath, ["--check", f], { stdio: "pipe" });
    console.log("ok   sintaxe  " + f.replace(ROOT + "/", ""));
  } catch (e) {
    errors++;
    console.error("ERRO sintaxe  " + f.replace(ROOT + "/", "") + "\n" + (e.stderr ? e.stderr.toString() : e.message));
  }
}

// 2) Grafo de módulos importa sem erros de resolução/execução no topo.
try {
  await import(pathToFileURL(join(ROOT, "src", "data.js")).href);
  await import(pathToFileURL(join(ROOT, "src", "util.js")).href);
  console.log("ok   import   camada de dados/util resolvem");
} catch (e) {
  errors++;
  console.error("ERRO import   " + e.message);
}

// 3) Assets essenciais presentes.
const required = [
  "index.html",
  "assets/css/pj-tokens.css",
  "assets/css/colors_and_type.css",
  "assets/css/app.css",
  "assets/fonts/NuSansDisplay-Semibold.otf",
  "assets/fonts/NuSansText-Regular.otf",
  "src/app.js",
];
for (const r of required) {
  if (existsSync(join(ROOT, r))) console.log("ok   asset    " + r);
  else { errors++; console.error("ERRO asset    ausente: " + r); }
}

if (errors) {
  console.error(`\nValidação falhou com ${errors} erro(s).`);
  process.exit(1);
}
console.log("\nValidação OK — sintaxe, imports e assets.");
