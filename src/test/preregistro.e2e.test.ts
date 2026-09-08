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
    // N4 — estas tres escrituras son comportamiento real del pipeline, descubiertas
    // al endurecer fakeFetch en el Bloque 3 de A2; la igualdad exacta es intencional
    // para que una cuarta escritura ponga el test rojo.
    'deniega exactamente las 3 escrituras conocidas a Supabase, ninguna más',
    async () => {
      await runPreregistro();

      expect(control.denied).toEqual([
        'POST https://placeholder.supabase.co/rest/v1/forge_project_memory?on_conflict=project_id',
        'POST https://placeholder.supabase.co/rest/v1/forge_project_memory?on_conflict=project_id',
        'PATCH https://placeholder.supabase.co/rest/v1/forge_projects?id=eq.preregistro-test-project',
      ]);
    },
    // N5 — timeout duro < 15s.
    15000
  );

  it('deniega escrituras POST a Supabase REST', async () => {
    await expect(
      fetch('https://placeholder.supabase.co/rest/v1/forge_intent_log', {
        method: 'POST',
        body: '{}',
      })
    ).rejects.toThrow();

    expect(control.denied.some((entry) => entry.startsWith('POST '))).toBe(true);
  });
});
