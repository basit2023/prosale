
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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

const pendingGetRequests = new Map<string, Promise<AxiosResponse<any>>>();

// Share identical GETs that are already in flight. Results are not retained,
// so mutations and later refreshes always receive fresh server data.
export const deduplicatedGet = <T = any>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => {
  const key = `${url}|${JSON.stringify(config.params || {})}`;
  const existing = pendingGetRequests.get(key);
  if (existing) return existing as Promise<AxiosResponse<T>>;

  const request = apiService.get<T>(url, config).finally(() => {
    pendingGetRequests.delete(key);
  });
  pendingGetRequests.set(key, request);
  return request;
};

let cachedEncryptedData: string | null | undefined;
let cachedToken: string | null = null;

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const encryptedData = localStorage.getItem('userData');
    if (encryptedData === cachedEncryptedData) return cachedToken;

    cachedEncryptedData = encryptedData;
    cachedToken = null;
    if (!encryptedData) return cachedToken;

    const decryptedData = AES.decrypt(encryptedData, 'encryptionSecret');
    const text = decryptedData.toString(enc.Utf8);
    if (!text) return cachedToken;

    const parsed: any = JSON.parse(text);
    cachedToken = (
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.data?.token ||
      parsed?.user?.token ||
      null
    );
    return cachedToken;
  } catch {
    cachedToken = null;
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
