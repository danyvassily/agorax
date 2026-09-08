/**
 * Vitest Wrapper — Deep Database & Supabase Agent (Couche 2)
 */
import { describe, it, expect } from "vitest";
import { DeepDatabaseAgent } from "../../scripts/agents/deep-database-agent";
import type { AgentSectionReport } from "../../scripts/agents/types";

describe("Agent Base de Données & Supabase Approfondi (Couche 2)", () => {
  it("exécute l'ensemble des 6 scénarios de validation base de données sans aucun échec", async () => {
    const agent = new DeepDatabaseAgent();
    const report = await agent.runAll();

    if (!report.success) {
      console.error("Échecs de l'agent base de données approfondi:", report.errors);
    }

    expect(report.success).toBe(true);
    expect(report.failedAssertions).toBe(0);
    expect(report.passedAssertions).toBeGreaterThanOrEqual(46);
    expect(report.errors).toEqual([]);

    // Validation des sections individuelles
    const schemaSec = report.sections.find((s: AgentSectionReport) => s.title.includes("Intégrité des Schémas"));
    expect(schemaSec?.passed).toBe(true);

    const rlsSec = report.sections.find((s: AgentSectionReport) => s.title.includes("RLS"));
    expect(rlsSec?.passed).toBe(true);

    const rpcSec = report.sections.find((s: AgentSectionReport) => s.title.includes("RPC"));
    expect(rpcSec?.passed).toBe(true);

    const outageSec = report.sections.find((s: AgentSectionReport) => s.title.includes("Résilience"));
    expect(outageSec?.passed).toBe(true);

    const zodSec = report.sections.find((s: AgentSectionReport) => s.title.includes("Zod"));
    expect(zodSec?.passed).toBe(true);
  });
});
