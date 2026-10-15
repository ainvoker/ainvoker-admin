import { getFreshAccessToken } from '../utils/auth';

/** Extract the message from backend `{ error: { code, message } }` (or legacy string error). */
function parseApiErrorMessage(data: unknown, status: number): string {
  const body = data as { error?: string | { message?: string } } | null;

  if (typeof body?.error === 'string') return body.error;
  if (body?.error && typeof body.error === 'object' && typeof body.error.message === 'string') {
    return body.error.message;
  }
  return `Request failed (${status})`;
}

export default class Service {
  async handle<T>(fn: () => Promise<T>): Promise<[T | null, string | undefined]> {
    try {
      const res = await fn();
      return [res, undefined];
    } catch (err) {
      return [null, err instanceof Error ? err.message : 'Unknown error'];
    }
  }

  private withBearerToken(options: RequestInit | undefined, token: string): RequestInit {
    const headers = new Headers(options?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return { ...options, headers };
  }

  async request<T = unknown>(
    uri: string,
    options?: RequestInit,
  ): Promise<[T | null, string | undefined]> {
    return this.handle<T>(async () => {
      const execute = async (init?: RequestInit) => {
        const res = await fetch(uri, init);
        const data = await res.json().catch(() => null);
        return { res, data };
      };

      let { res, data } = await execute(options);

      // Neon Auth JWTs expire while the SPA stays open. Refresh once and retry.
      if (res.status === 401) {
        const fresh = await getFreshAccessToken();
        if (fresh) {
          ({ res, data } = await execute(this.withBearerToken(options, fresh)));
        }
      }

      if (!res.ok) {
        throw new Error(parseApiErrorMessage(data, res.status));
      }

      return ((data as { data?: T } | null)?.data ?? data) as T;
    });
  }
}
