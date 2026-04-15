export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

export const getAuthToken = (): string | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};
