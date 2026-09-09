import { describe, it, expect } from 'vitest';
import { isLastDone, getPlainEnglish, type ProgressLine } from './progressSummary';

describe('getPlainEnglish', () => {
  it('returns the approval message when a plan is pending', () => {
    const lines: ProgressLine[] = [{ text: 'Creating Hero.tsx', status: 'done' }];
    expect(getPlainEnglish(lines, true)).toBe('Esperando tu aprobación...');
  });

  it('returns the generic fallback when lines is empty', () => {
    expect(getPlainEnglish([], false)).toBe('Working on it...');
  });

  it('returns the planning message for a pending "Planning..." line', () => {
    const lines: ProgressLine[] = [{ text: 'Planning...', status: 'pending' }];
    expect(getPlainEnglish(lines, false)).toBe('Figuring out what to build...');
  });

  it('returns the creating message for a Creating line', () => {
    const lines: ProgressLine[] = [{ text: 'Creating Hero.tsx', status: 'pending' }];
    expect(getPlainEnglish(lines, false)).toBe('Writing new components...');
  });

  it('returns the updating message for an Updating line', () => {
    const lines: ProgressLine[] = [{ text: 'Updating Hero.tsx', status: 'pending' }];
    expect(getPlainEnglish(lines, false)).toBe('Updating existing files...');
  });

  it('returns the deleting message for a Deleting line', () => {
    const lines: ProgressLine[] = [{ text: 'Deleting Hero.tsx', status: 'pending' }];
    expect(getPlainEnglish(lines, false)).toBe('Removing files...');
  });

  it('returns the fixing message for a Fixing line', () => {
    const lines: ProgressLine[] = [{ text: 'Fixing compile error (attempt 1/3)...', status: 'pending' }];
    expect(getPlainEnglish(lines, false)).toBe('Fixing a small issue...');
  });

  it('returns the done message for a Modified line', () => {
    const lines: ProgressLine[] = [{ text: 'Modified Hero.tsx', status: 'done' }];
    expect(getPlainEnglish(lines, false)).toBe('All done ✓');
  });

  it('prefers the pending line over the last line when both exist', () => {
    const lines: ProgressLine[] = [
      { text: 'Deleting Hero.tsx', status: 'pending' },
      { text: 'Creating Footer.tsx', status: 'done' },
    ];
    expect(getPlainEnglish(lines, false)).toBe('Removing files...');
  });

  // Comportamiento ACTUAL, incorrecto. El Bloque 2 invierte este aserto.
  it('BUG: treats an error line as the last-done line', () => {
    expect(isLastDone([{ text: 'Updating Hero.tsx', status: 'error' }])).toBe(true);
  });

  // Comportamiento ACTUAL, incorrecto. El Bloque 2 invierte este aserto.
  it('BUG: reports an errored line as still "Updating existing files..."', () => {
    expect(
      getPlainEnglish([{ text: 'Updating Hero.tsx', status: 'error' }], false)
    ).toBe('Updating existing files...');
  });
});
