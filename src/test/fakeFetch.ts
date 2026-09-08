export interface FakeFetchControl {
  denied: string[];
  calls: string[];
  restore: () => void;
}

const CHAT_FORGE_FIXTURE = { ok: true, source: 'fakeFetch', route: 'chat-forge' };
const COMPILE_FIXTURE = { ok: true, source: 'fakeFetch', route: 'compile' };

function toUrlString(input: string | Request | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export function installFakeFetch(): FakeFetchControl {
  const originalFetch = globalThis.fetch;
  const denied: string[] = [];
  const calls: string[] = [];

  globalThis.fetch = (async (input: string | Request | URL, _init?: RequestInit) => {
    const url = toUrlString(input);
    calls.push(url);

    if (url.includes('/api/chat-forge')) {
      return new Response(JSON.stringify(CHAT_FORGE_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.includes('/api/compile')) {
      return new Response(JSON.stringify(COMPILE_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    denied.push(url);
    throw new Error('[fakeFetch] red saliente denegada: ' + url);
  }) as typeof fetch;

  return {
    denied,
    calls,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}
