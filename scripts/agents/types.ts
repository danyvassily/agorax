/**
 * Agorax Testing Agents — Types & Interfaces
 */

export type AgentType = "unit" | "integration" | "simulation";

export interface AssertionResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface AgentSectionReport {
  title: string;
  assertions: AssertionResult[];
  passed: boolean;
  durationMs: number;
}

export interface AgentReport {
  agent: AgentType;
  title: string;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  durationMs: number;
  sections: AgentSectionReport[];
  success: boolean;
  errors: string[];
}

export interface SimulationBot {
  id: string;
  name: string;
  persona: "host" | "speedy" | "pondering" | "random" | "bilingual" | "flaky";
  language: "fr" | "en";
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  connected: boolean;
  responseTimeMs: number;
}

export interface SimulationEvent {
  timestamp: number;
  phase: string;
  actor: string;
  action: string;
  details?: Record<string, unknown>;
}

export interface SimulationTrace {
  mode: string;
  playersCount: number;
  roundsCount: number;
  events: SimulationEvent[];
  invariantsPassed: boolean;
  invariantsChecked: string[];
  finalScores: Record<string, number>;
  winner: string;
  durationMs: number;
}
