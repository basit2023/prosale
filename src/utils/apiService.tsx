
import axios, { AxiosInstance } from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

const apiService: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;

    if (status === 401 && typeof window !== 'undefined') {
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
