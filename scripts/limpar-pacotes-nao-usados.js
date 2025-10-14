#!/usr/bin/env node
/**
 * Script: limpar-pacotes-nao-usados.js
 * Finalidade: Detectar e remover dependências não utilizadas no projeto Yarn
 * Compatível com Yarn v1
 */

import { execSync } from "child_process";
import depcheck from "depcheck";
import readline from "readline";

async function main() {
  console.log("🔍 Verificando pacotes não utilizados com depcheck...\n");

  const result = await depcheck(process.cwd(), {
    ignorePatterns: ["dist", "build", "node_modules"],
  });

  const unusedDeps = result.dependencies;
  const unusedDevDeps = result.devDependencies;

  if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
    console.log("✅ Nenhum pacote não utilizado encontrado.");
    process.exit(0);
  }

  console.log("📦 Dependências não utilizadas detectadas:");
  if (unusedDeps.length > 0)
    console.log("  - Dependências:", unusedDeps.join(", "));
  if (unusedDevDeps.length > 0)
    console.log("  - DevDependencies:", unusedDevDeps.join(", "));

  const allUnused = [...unusedDeps, ...unusedDevDeps];
  console.log("\n");

  // Pergunta ao usuário se deseja remover
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("❓ Deseja remover esses pacotes? (s/n): ", (answer) => {
    rl.close();
    if (answer.toLowerCase() === "s" || answer.toLowerCase() === "sim") {
      try {
        console.log("\n🧹 Removendo pacotes não utilizados...");
        execSync(`yarn remove ${allUnused.join(" ")}`, { stdio: "inherit" });
        console.log("\n✅ Limpeza concluída com sucesso!");
      } catch (err) {
        console.error("❌ Erro ao remover pacotes:", err.message);
      }
    } else {
      console.log("🚫 Operação cancelada.");
    }
  });
}

main();
