import axios from 'axios';
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  persistSession,
} from './session';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue = [];

const queueTokenRefresh = (callback) => {
  refreshQueue.push(callback);
};

const resolveRefreshQueue = (newAccessToken) => {
  refreshQueue.forEach((callback) => callback(newAccessToken));
  refreshQueue = [];
};

const shouldSkipRefresh = (requestUrl = '') =>
  requestUrl.includes('/user/login') ||
  requestUrl.includes('/user/register') ||
  requestUrl.includes('/user/token/refresh') ||
  requestUrl.includes('/user/password/forgot');

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const statusCode = error?.response?.status;

    if (!originalRequest || statusCode !== 401 || originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearStoredSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queueTokenRefresh((newAccessToken) => {
          if (!newAccessToken) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post('/user/token/refresh', {
        refreshToken,
      });
      const newSession = refreshResponse?.data;
      if (!newSession?.accessToken) {
        throw new Error('Invalid refresh response');
      }

      persistSession(newSession);
      resolveRefreshQueue(newSession.accessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      resolveRefreshQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
