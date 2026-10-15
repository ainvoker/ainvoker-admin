import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from '@neondatabase/neon-js/auth/types';
import AuthService from '../services/AuthService';
import UserService, { type BootstrapResult } from '../services/UserService';
import {
  isAccessTokenExpiringSoon,
  msUntilAccessTokenRefresh,
  setAccessTokenProvider,
} from '../utils/auth';

const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  /** App user from the last successful bootstrap (null until synced). */
  appBootstrap: BootstrapResult | null;
  /** Set when the session exists but `/me/bootstrap` failed (API down, CORS, etc.). */
  bootstrapError: string | null;
  isPlatformAdmin: boolean;
  setAuth: (data: User | undefined) => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
  signout: () => Promise<void>;
}>({
  user: null,
  token: null,
  appBootstrap: null,
  bootstrapError: null,
  isPlatformAdmin: false,
  setAuth: () => {},
  isLoading: true,
  refresh: async () => {},
  signout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/** Survives React Strict Mode remounts (refs alone do not). */
const bootstrapInFlight = new Map<string, Promise<BootstrapResult | null>>();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appBootstrap, setAppBootstrap] = useState<BootstrapResult | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const bootstrappedFor = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const syncAppUser = useCallback(async (sessionToken: string, neonUser: User) => {
    const existing = bootstrapInFlight.get(neonUser.id);
    if (existing) {
      const result = await existing;
      if (result) {
        setAppBootstrap(result);
        setBootstrapError(null);
        bootstrappedFor.current = neonUser.id;
      }
      return;
    }

    const run = (async () => {
      const [result, syncErr] = await UserService.bootstrap(sessionToken, {
        name: neonUser.name,
        email: neonUser.email,
        image: neonUser.image,
      });

      if (syncErr || !result) {
        console.error('Failed to provision app user:', syncErr);
        setBootstrapError(syncErr ?? 'Failed to load your account');
        return null;
      }

      bootstrappedFor.current = neonUser.id;
      setAppBootstrap(result);
      setBootstrapError(null);
      return result;
    })();

    bootstrapInFlight.set(neonUser.id, run);
    try {
      await run;
    } finally {
      bootstrapInFlight.delete(neonUser.id);
    }
  }, []);

  const applySession = useCallback(async (
    sessionToken: string,
    neonUser: User,
    options?: { syncApp?: boolean },
  ) => {
    tokenRef.current = sessionToken;
    setToken(sessionToken);
    setUser(neonUser);

    // Skip bootstrap on silent JWT refreshes once the app user is already provisioned.
    const shouldSync =
      options?.syncApp !== false ||
      bootstrappedFor.current !== neonUser.id;
    if (shouldSync) {
      await syncAppUser(sessionToken, neonUser);
    }
  }, [syncAppUser]);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    setAppBootstrap(null);
    setBootstrapError(null);
    bootstrappedFor.current = null;
  }, []);

  /**
   * Re-read session from Neon Auth.
   * @param silent - when true, skip the full-page loading gate (background refresh).
   */
  const fetchAuthUser = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    const [data] = await AuthService.getAuthUser();

    if (!data) {
      clearSession();
      if (!silent) setLoading(false);
      return null;
    }

    // Neon injects a short-lived JWT into session.token (set-auth-jwt).
    await applySession(data.session.token, data.user, { syncApp: !silent });
    if (!silent) setLoading(false);
    return data.session.token;
  }, [applySession, clearSession]);

  /** Returns a usable access token, refreshing when the JWT is near expiry (or when forced). */
  const getAccessToken = useCallback(async (options?: { force?: boolean }): Promise<string | null> => {
    const current = tokenRef.current;
    if (!options?.force && current && !isAccessTokenExpiringSoon(current)) {
      return current;
    }

    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    refreshInFlight.current = (async () => {
      try {
        return await fetchAuthUser(true);
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, [fetchAuthUser]);

  const setAuth = (data: User | undefined) => {
    setUser(data ?? null);
    if (!data) setAppBootstrap(null);
  };

  const refresh = useCallback(async () => {
    await fetchAuthUser(false);
  }, [fetchAuthUser]);

  const signout = useCallback(async () => {
    await AuthService.signout();
    await fetchAuthUser(false);
  }, [fetchAuthUser]);

  useEffect(() => {
    void fetchAuthUser(false);
  }, [fetchAuthUser]);

  // Let Service retry on 401 without pulling React into the request layer.
  useEffect(() => {
    setAccessTokenProvider(getAccessToken);
    return () => setAccessTokenProvider(null);
  }, [getAccessToken]);

  // Proactively refresh before the JWT expires.
  useEffect(() => {
    if (!token) return;

    const delay = msUntilAccessTokenRefresh(token);
    if (delay === null) return;

    const id = window.setTimeout(() => {
      void fetchAuthUser(true);
    }, delay);

    return () => window.clearTimeout(id);
  }, [token, fetchAuthUser]);

  // Tab focus / visibility: refresh if the token aged out while backgrounded.
  useEffect(() => {
    const maybeRefresh = () => {
      const current = tokenRef.current;
      if (current && isAccessTokenExpiringSoon(current)) {
        void fetchAuthUser(true);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') maybeRefresh();
    };

    window.addEventListener('focus', maybeRefresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', maybeRefresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchAuthUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        appBootstrap,
        bootstrapError,
        isPlatformAdmin: appBootstrap?.isPlatformAdmin ?? false,
        setAuth,
        isLoading: loading,
        refresh,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
