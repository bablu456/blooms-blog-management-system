const AUTH_SESSION_KEY = 'auth_session';
const LEGACY_USER_KEY = 'user';
export const AUTH_SESSION_EVENT = 'auth:session-change';

const emitSessionChange = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

export const getStoredSession = () => {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

export const persistSession = (session) => {
  if (!session) return;
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_USER_KEY);
  emitSessionChange();
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  emitSessionChange();
};

export const getAccessToken = () => getStoredSession()?.accessToken || null;

export const getRefreshToken = () => getStoredSession()?.refreshToken || null;

export const getStoredUser = () => {
  const session = getStoredSession();
  if (session?.user) return session.user;

  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (!legacyUser) return null;

  try {
    return JSON.parse(legacyUser);
  } catch {
    localStorage.removeItem(LEGACY_USER_KEY);
    return null;
  }
};

export const updateStoredUser = (user) => {
  if (!user) return;
  const session = getStoredSession();
  if (session?.accessToken && session?.refreshToken) {
    persistSession({ ...session, user });
    return;
  }
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
  emitSessionChange();
};
