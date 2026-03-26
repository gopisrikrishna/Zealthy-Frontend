const TOKEN_KEY = 'zealthy_patient_token';
const USER_KEY = 'zealthy_patient_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token || '');
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}
