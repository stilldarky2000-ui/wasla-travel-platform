import { auth } from './firebase';

/**
 * Authenticated fetch wrapper that automatically attaches the signed-in user's
 * Firebase ID token as `Authorization: Bearer <token>` for protected `/api/*` routes.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? {});
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken();
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
    } catch {
      // Allow server to return 401 cleanly if token retrieval fails
    }
  }
  return fetch(input, { ...init, headers });
}
