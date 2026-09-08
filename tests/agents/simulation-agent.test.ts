/**
 * Vitest Wrapper — Simulation Test Agent
 */
import { describe, it, expect } from "vitest";
import { SimulationTestAgent } from "../../scripts/agents/simulation-test-agent";

describe("Agent de Tests de Simulation Multi-Agents — AgoraX", () => {
  it("exécute avec succès toutes les simulations de parties et valide les invariants", async () => {
    const agent = new SimulationTestAgent();
    const report = await agent.runAll();

    if (!report.success) {
      console.error("Échecs de l'agent de simulation:", report.errors);
    }

    expect(report.success).toBe(true);
    expect(report.failedAssertions).toBe(0);
    expect(report.passedAssertions).toBe(report.totalAssertions);
    expect(report.totalAssertions).toBeGreaterThanOrEqual(30);
  });
});
