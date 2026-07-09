
import axios, { AxiosInstance } from 'axios';
import { AES, enc } from 'crypto-js';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

const apiService: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const encryptedData = localStorage.getItem('userData');
    if (!encryptedData) return null;

    const decryptedData = AES.decrypt(encryptedData, 'encryptionSecret');
    const text = decryptedData.toString(enc.Utf8);
    if (!text) return null;

    const parsed: any = JSON.parse(text);
    return (
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.data?.token ||
      parsed?.user?.token ||
      null
    );
  } catch {
    return null;
  }
};

apiService.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as any;
  }

  const headers = config.headers as any;
  const hasAuthHeader = Boolean(headers.Authorization || headers.authorization);
  const token = hasAuthHeader ? null : getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const isBackgroundAiRequest =
      typeof url === 'string' && (url.includes('/ai-chat') || url.includes('/ai/'));

    if (status === 401 && typeof window !== 'undefined' && !isBackgroundAiRequest) {
      localStorage.removeItem('userData');
      localStorage.removeItem('uData');
    }

    if (status) {
      console.error(`[API Error] ${status} ${url}`);
    } else if (error?.request) {
      console.error('[API Network Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiService;
