/**
 * Vitest Wrapper — Integration Test Agent
 */
import { describe, it, expect } from "vitest";
import { IntegrationTestAgent } from "../../scripts/agents/integration-test-agent";

describe("Agent de Tests d'Intégration — AgoraX", () => {
  it("exécute avec succès toutes les assertions de validation des routes API et flux serveur", async () => {
    const agent = new IntegrationTestAgent();
    const report = await agent.runAll();

    if (!report.success) {
      console.error("Échecs de l'agent d'intégration:", report.errors);
    }

    expect(report.success).toBe(true);
    expect(report.failedAssertions).toBe(0);
    expect(report.passedAssertions).toBe(report.totalAssertions);
    expect(report.totalAssertions).toBeGreaterThanOrEqual(25);
  });
});
