import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installFakeFetch, type FakeFetchControl } from './fakeFetch';
import { AIOrchestrator } from '@/services/AIOrchestrator';
import type { BuildStep } from '@/services/Architect';
import type { OrchestratorResult } from '@/services/AIOrchestrator';

let control: FakeFetchControl;

interface RunOutcome {
  result: OrchestratorResult;
  planCalls: BuildStep[][];
  progressCalls: Array<{ step: number; total: number; file: string }>;
}

/** Una vuelta del pipeline real (Architect -> Implementer -> Verifier) contra el LLM falso. */
async function runPreregistro(): Promise<RunOutcome> {
  const files = new Map<string, string>();
  const planCalls: BuildStep[][] = [];
  const progressCalls: Array<{ step: number; total: number; file: string }> = [];

  const result = await AIOrchestrator.parseUserCommand(
    'Agrega dos secciones de demostración a la landing',
    files,
    null,
    'preregistro-test-project',
    (stepNumber, totalSteps, currentFile) => {
      progressCalls.push({ step: stepNumber, total: totalSteps, file: currentFile });
    },
    undefined,
    (steps) => {
      planCalls.push(steps);
    }
  );

  return { result, planCalls, progressCalls };
}

describe('Bloque 2 — pre-registro (e2e con LLM falso)', () => {
  beforeEach(() => {
    control = installFakeFetch();
  });

  afterEach(() => {
    control.restore();
  });

  it(
    // N1, N2, N3 — completa sin lanzar, plan de 2 pasos, progreso [1/2] y [2/2].
    'recorre el plan de 2 pasos y dispara el progreso [1/2] y [2/2]',
    async () => {
      const { result, planCalls, progressCalls } = await runPreregistro();

      expect(result).toBeDefined();
      expect(result.outcome).toBe('success');

      expect(planCalls).toHaveLength(1);
      expect(planCalls[0]).toHaveLength(2);

      expect(progressCalls).toHaveLength(2);
      expect(progressCalls[0]).toMatchObject({ step: 1, total: 2 });
      expect(progressCalls[1]).toMatchObject({ step: 2, total: 2 });
    },
    // N5 — timeout duro < 15s.
    15000
  );

  it(
    // N4 — el registro de denegadas queda vacío al terminar: cero red saliente real.
    'termina con el registro de denegadas vacío — cero red saliente',
    async () => {
      await runPreregistro();

      expect(control.denied).toEqual([]);
    },
    // N5 — timeout duro < 15s.
    15000
  );
});
