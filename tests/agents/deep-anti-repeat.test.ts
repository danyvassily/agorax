import { describe, expect, it } from "vitest";
import { DeepAntiRepeatAgent } from "../../scripts/agents/deep-anti-repeat-agent";

describe("Deep Question Anti-Repetition Agent (Couche 2)", () => {
  it("exécute l'ensemble des 6 scénarios anti-répétition sans aucun échec", async () => {
    const agent = new DeepAntiRepeatAgent();
    const report = await agent.runAll();

    expect(report.success).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.passedAssertions).toBeGreaterThanOrEqual(118);
    expect(report.failedAssertions).toBe(0);

    // Vérification individuelle de chaque section critique
    const sections = report.sections;
    const marathon = sections.find((s) => s.title.includes("Marathon"));
    expect(marathon?.passed).toBe(true);

    const union8 = sections.find((s) => s.title.includes("8 Joueurs"));
    expect(union8?.passed).toBe(true);

    const deduplication = sections.find((s) => s.title.includes("Trans-Langue"));
    expect(deduplication?.passed).toBe(true);

    const fallback = sections.find((s) => s.title.includes("Progressive Fallback"));
    expect(fallback?.passed).toBe(true);

    const reservation = sections.find((s) => s.title.includes("Réservations"));
    expect(reservation?.passed).toBe(true);

    const robustness = sections.find((s) => s.title.includes("Robustesse"));
    expect(robustness?.passed).toBe(true);
  });
});

