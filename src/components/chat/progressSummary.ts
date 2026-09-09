export type ProgressLine = { text: string; status: 'pending' | 'done' | 'error' };

export const isLastDone = (lines: ProgressLine[]): boolean =>
  lines.length > 0 && lines[lines.length - 1].status !== 'pending';

export const getPlainEnglish = (lines: ProgressLine[], hasPendingPlan: boolean): string => {
  // Con un plan esperando aprobación nada se está ejecutando: las líneas de
  // detalle describen lo que se HARÁ, no lo que se hace. Cortar aquí, antes
  // de cualquier coincidencia por substring, evita que el panel afirme un
  // trabajo en curso que el gate de abajo desmiente en la misma pantalla.
  if (hasPendingPlan) return 'Esperando tu aprobación...';
  const pending = lines.find(l => l.status === 'pending');
  const lastLine = pending || lines[lines.length - 1];
  if (!lastLine) return 'Working on it...';
  const text = lastLine.text;
  if (text === 'Planning...') return 'Figuring out what to build...';
  if (text.includes('Creating')) return 'Writing new components...';
  // Los verbos nuevos necesitan su rama o la cabecera cae al genérico
  // 'Working on it...' en todo plan de modify/delete — honesto pero mudo.
  // Parche mínimo y consciente: sigue siendo matching por substring, y muere
  // entero cuando la línea lleve su propio `kind` (Fase 2, en catálogo).
  if (text.includes('Updating')) return 'Updating existing files...';
  if (text.includes('Deleting')) return 'Removing files...';
  if (text.includes('Fixing')) return 'Fixing a small issue...';
  if (text.includes('Modified')) return 'All done ✓';
  return 'Working on it...';
};
