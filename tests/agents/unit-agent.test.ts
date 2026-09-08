/**
 * Vitest Wrapper — Unit Test Agent
 */
import { describe, it, expect } from "vitest";
import { UnitTestAgent } from "../../scripts/agents/unit-test-agent";

describe("Agent de Tests Unitaires — AgoraX", () => {
  it("exécute avec succès toutes les assertions de validation des moteurs", async () => {
    const agent = new UnitTestAgent();
    const report = await agent.runAll();

    if (!report.success) {
      console.error("Échecs de l'agent unitaire:", report.errors);
    }

    expect(report.success).toBe(true);
    expect(report.failedAssertions).toBe(0);
    expect(report.passedAssertions).toBe(report.totalAssertions);
    expect(report.totalAssertions).toBeGreaterThanOrEqual(30);
  });
});
