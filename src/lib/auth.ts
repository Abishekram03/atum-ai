export type AuthSession = {
  email: string;
  authenticatedAt: number;
};

const AUTH_SESSION_KEY = "atum-admin-session";
export const AUTH_SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function isAuthSessionExpired(session: AuthSession): boolean {
  return Date.now() - session.authenticatedAt > AUTH_SESSION_TTL_MS;
}

export function saveAuthSession(email: string): void {
  if (typeof window === "undefined") return;

  const session: AuthSession = {
    email,
    authenticatedAt: Date.now(),
  };

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
