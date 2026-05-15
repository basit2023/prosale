
import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const apiService: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true
});

export default apiService;