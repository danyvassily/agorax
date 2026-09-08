/**
 * Agorax — Orchestrateur Maître des Agents de Test (Couches 1 & 2)
 *
 * Lance de manière séquentielle ou ciblée les 5 agents de test autonomes :
 *  Couche 1 (Filtres & Moteurs) :
 *   1. Agent Tests Unitaires (Unit Test Agent)
 *   2. Agent Tests d'Intégration (Integration Test Agent)
 *   3. Agent Tests de Simulation (Simulation Test Agent)
 *  Couche 2 (Tests Approfondis) :
 *   4. Agent Anti-Répétition Approfondi (Deep Anti-Repeat Agent)
 *   5. Agent Base de Données & Supabase Approfondi (Deep Database Agent)
 *
 * Usage :
 *   npx tsx scripts/agents/orchestrator.ts [--all] [--unit] [--integration] [--simulation] [--deep] [--anti-repeat] [--database]
 */
import { UnitTestAgent } from "./unit-test-agent";
import { IntegrationTestAgent } from "./integration-test-agent";
import { SimulationTestAgent } from "./simulation-test-agent";
import { DeepAntiRepeatAgent } from "./deep-anti-repeat-agent";
import { DeepDatabaseAgent } from "./deep-database-agent";
import type { AgentReport } from "./types";

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes("--all") || args.length === 0;
  const runDeep = args.includes("--deep");

  const runUnit = args.includes("--unit") || runAll;
  const runIntegration = args.includes("--integration") || runAll;
  const runSimulation = args.includes("--simulation") || runAll;
  const runAntiRepeat = args.includes("--anti-repeat") || runDeep || runAll;
  const runDatabase = args.includes("--database") || runDeep || runAll;

  console.log("\n========================================================");
  console.log("🚀 AGORAX — SUITE AUTONOME DES AGENTS DE TEST (COUCHES 1 & 2)");
  console.log("========================================================");

  const reports: AgentReport[] = [];
  const startGlobal = performance.now();

  // 1. Agent Tests Unitaires
  if (runUnit) {
    console.log("\n▶ [Couche 1] Lancement de l'Agent de Tests Unitaires...");
    const unitAgent = new UnitTestAgent();
    const rep = await unitAgent.runAll();
    reports.push(rep);
    printReport(rep);
  }

  // 2. Agent Tests d'Intégration
  if (runIntegration) {
    console.log("\n▶ [Couche 1] Lancement de l'Agent de Tests d'Intégration...");
    const intAgent = new IntegrationTestAgent();
    const rep = await intAgent.runAll();
    reports.push(rep);
    printReport(rep);
  }

  // 3. Agent Tests de Simulation
  if (runSimulation) {
    console.log("\n▶ [Couche 1] Lancement de l'Agent de Tests de Simulation...");
    const simAgent = new SimulationTestAgent();
    const rep = await simAgent.runAll();
    reports.push(rep);
    printReport(rep);
  }

  // 4. Agent Anti-Répétition Approfondi (Couche 2)
  if (runAntiRepeat) {
    console.log("\n▶ [Couche 2] Lancement de l'Agent Anti-Répétition Approfondi...");
    const antiRepeatAgent = new DeepAntiRepeatAgent();
    const rep = await antiRepeatAgent.runAll();
    reports.push(rep);
    printReport(rep);
  }

  // 5. Agent Base de Données & Supabase Approfondi (Couche 2)
  if (runDatabase) {
    console.log("\n▶ [Couche 2] Lancement de l'Agent Base de Données & Supabase Approfondi...");
    const dbAgent = new DeepDatabaseAgent();
    const rep = await dbAgent.runAll();
    reports.push(rep);
    printReport(rep);
  }

  const globalDuration = performance.now() - startGlobal;
  const totalAssertions = reports.reduce((acc, r) => acc + r.totalAssertions, 0);
  const passedAssertions = reports.reduce((acc, r) => acc + r.passedAssertions, 0);
  const failedAssertions = reports.reduce((acc, r) => acc + r.failedAssertions, 0);
  const allPassed = reports.every((r) => r.success);

  console.log("\n========================================================");
  console.log("📊 BILAN GLOBAL DES AGENTS DE TEST");
  console.log("========================================================");
  console.log(`⏱️  Durée globale   : ${globalDuration.toFixed(1)} ms`);
  console.log(`🎯 Assertions      : ${passedAssertions} / ${totalAssertions} passées (${((passedAssertions / (totalAssertions || 1)) * 100).toFixed(1)}%)`);
  console.log(`❌ Échecs totaux   : ${failedAssertions}`);
  console.log(`🏁 Résultat final  : ${allPassed ? "✅ SUCCÈS TOTAL — 100% DES TESTS ET INVARIANTS CONFORMES" : "❌ ÉCHECS DÉTECTÉS"}`);
  console.log("========================================================\n");

  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

function printReport(report: AgentReport) {
  const icon = report.success ? "✅" : "❌";
  console.log(`\n${icon} ${report.title}`);
  console.log(`   Durée : ${report.durationMs.toFixed(1)}ms | Assertions : ${report.passedAssertions}/${report.totalAssertions}`);
  for (const sec of report.sections) {
    const sIcon = sec.passed ? "  ✓" : "  ✗";
    console.log(`   ${sIcon} ${sec.title} (${sec.assertions.length} vérifications)`);
    for (const a of sec.assertions) {
      if (!a.passed) {
        console.log(`       ❌ ${a.name} : ${a.error}`);
      }
    }
  }
  if (report.errors.length > 0) {
    console.log(`   ⚠️ Erreurs relevées :`, report.errors);
  }
}

main().catch((err) => {
  console.error("Erreur critique orchestrateur:", err);
  process.exit(1);
});
