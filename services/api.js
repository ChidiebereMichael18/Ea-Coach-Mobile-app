import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://ea-coach-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor to attach token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@ea_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
