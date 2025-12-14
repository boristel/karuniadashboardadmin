import axios from 'axios';

// Get API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (API_TOKEN) {
      config.headers.Authorization = `Bearer ${API_TOKEN}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/local', {
      identifier,
      password,
    });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/local/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  me: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (code: string, password: string, passwordConfirmation: string) => {
    const response = await api.post('/auth/reset-password', {
      code,
      password,
      passwordConfirmation,
    });
    return response.data;
  },
};

// Generic CRUD operations
export const createCRUDAPI = (endpoint: string) => ({
  getAll: async (params = {}) => {
    const response = await api.get(`/${endpoint}`, { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/${endpoint}/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post(`/${endpoint}`, { data });
    return response.data;
  },

  update: async (id: string | number, data: any) => {
    const response = await api.put(`/${endpoint}/${id}`, { data });
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await api.delete(`/${endpoint}/${id}`);
    return response.data;
  },

  // Custom query for Strapi filters
  find: async (filters = {}) => {
    const response = await api.get(`/${endpoint}`, {
      params: {
        populate: '*',
        ...filters,
      },
    });
    return response.data;
  },
});

// Specific API endpoints
export const spkAPI = createCRUDAPI('spks');
export const vehicleTypesAPI = createCRUDAPI('vehicle-types');
export const vehicleGroupsAPI = createCRUDAPI('vehicle-groups');
export const colorsAPI = createCRUDAPI('colors');
export const supervisorsAPI = createCRUDAPI('supervisors');
export const branchesAPI = createCRUDAPI('branches');
export const salesStaffAPI = createCRUDAPI('sales-staffs');

// File upload helper
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('files', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default api;