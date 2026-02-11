import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const bootStarted = useRef(false);

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    const boot = async () => {
      try {
        const instance = await WebContainer.boot();
        setContainer(instance);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error during WebContainer boot'));
        setIsLoading(false);
      }
    };

    boot();
  }, []);

  return { container, isLoading, error };
}
