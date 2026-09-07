import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installFakeFetch, type FakeFetchControl } from './fakeFetch';

let control: FakeFetchControl;

describe('pipeline smoke', () => {
  beforeEach(() => {
    control = installFakeFetch();
  });

  afterEach(() => {
    control.restore();
  });

  it('el módulo AIOrchestrator se importa sin lanzar', async () => {
    const mod = await import('@/services/AIOrchestrator');
    expect(mod).toHaveProperty('AIOrchestrator');
  });

  it('el fake deniega y nombra la URL desconocida', async () => {
    const url = 'https://ejemplo.invalido/x';
    await expect(fetch(url)).rejects.toThrow('[fakeFetch] red saliente denegada: ' + url);
    expect(control.denied).toContain(url);
  });
});
