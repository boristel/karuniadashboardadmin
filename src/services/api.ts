import axios from 'axios';

// Get API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace('/api', '') || 'http://localhost:1337';
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
    // Don't add Authorization header for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');

    console.log(`🌐 MAIN API REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      isAuthEndpoint,
      hasJwtToken: !!localStorage.getItem('jwt_token'),
      hasApiToken: !!API_TOKEN,
      headers: config.headers,
      data: config.data
    });

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 Added JWT token to request`);
      } else if (API_TOKEN) {
        // Use API token only if no JWT token present
        config.headers.Authorization = `Bearer ${API_TOKEN}`;
        console.log(`🔑 Added API token to request`);
      }
    } else {
      console.log(`🚫 Skipping auth token for auth endpoint`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
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

// Test function to check Strapi endpoints
export const testStrapiConnection = async () => {
  try {
    console.log('Testing Strapi connection...');

    // Test 1: Check if Strapi is running
    const response1 = await axios.get(`${STRAPI_BASE_URL}/`);
    console.log('Strapi root status:', response1.status);

    // Test 2: Check if API endpoints exist
    const response2 = await axios.get(`${API_BASE_URL}/users`);
    console.log('API users status:', response2.status);

    // Test 3: Try auth endpoint with different URLs
    const possibleAuthUrls = [
      `${STRAPI_BASE_URL}/auth/local`,
      `${API_BASE_URL}/auth/local`,
      `${STRAPI_BASE_URL}/api/auth/local`,
    ];

    for (const url of possibleAuthUrls) {
      try {
        const testResponse = await axios.post(url, {}, {
          validateStatus: () => true // Don't throw on error status codes
        });
        console.log(`Auth endpoint test for ${url}:`, testResponse.status, testResponse.statusText);
      } catch (e: any) {
        console.log(`Auth endpoint test for ${url}: ERROR`, e.code);
      }
    }

    return true;
  } catch (error: any) {
    console.error('Strapi connection test failed:', error.message);
    return false;
  }
};

// Auth endpoints
export const authAPI = {
  login: async (identifier: string, password: string) => {
    // Try different endpoint patterns
    const endpoints = [
      '/auth/local',  // Standard Strapi public endpoint
      '/admin/login', // Admin panel endpoint
    ];

    console.log('🔍 API_BASE_URL:', API_BASE_URL);
    console.log('🔍 STRAPI_BASE_URL:', STRAPI_BASE_URL);

    for (const endpoint of endpoints) {
      // Use API_BASE_URL for auth endpoints (includes /api)
      const loginUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`=== Attempting login to: ${loginUrl} ===`);

      try {
        // Use direct axios call to avoid baseURL confusion
        const axiosInstance = axios.create({
          baseURL: API_BASE_URL, // Use API_BASE_URL which includes /api
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Try different payload formats
        const payloads = [
          { identifier, password },    // Standard format
          { email: identifier, password }, // Admin format
        ];

        for (const payload of payloads) {
          try {
            console.log(`--- Trying payload for ${endpoint}:`, payload);

            const response = await axiosInstance.post(endpoint, payload);

            console.log(`✅ SUCCESS! Login successful with ${endpoint} using payload:`, payload);
            console.log(`✅ Response data:`, response.data);
            console.log(`✅ Response headers:`, response.headers);
            console.log(`✅ Response status:`, response.status);

            return response.data;
          } catch (payloadError: any) {
            console.log(`❌ Payload failed for ${endpoint}:`, {
              status: payloadError.response?.status,
              statusText: payloadError.response?.statusText,
              data: payloadError.response?.data,
              config: {
                method: payloadError.config?.method,
                url: payloadError.config?.url,
                baseURL: payloadError.config?.baseURL,
                headers: payloadError.config?.headers
              }
            });

            // 400 means endpoint exists but credentials are wrong - this is expected behavior
            if (payloadError.response?.status === 400) {
              console.log(`ℹ️ INFO: 400 Bad Request for ${endpoint} - endpoint exists but credentials are invalid`);

              // If this is the first endpoint that returns 400, throw it so user sees "Invalid credentials"
              throw payloadError;
            }

            // If we get other errors (404, 405, etc.), continue to next payload
            continue;
          }
        }
      } catch (endpointError: any) {
        console.log(`=== Endpoint ${endpoint} completely failed ===`, {
          status: endpointError.response?.status,
          statusText: endpointError.response?.statusText,
          data: endpointError.response?.data,
          message: endpointError.message
        });

        // If this endpoint doesn't exist (404) or method not allowed (405), try next endpoint
        if (endpointError.response?.status === 404 || endpointError.response?.status === 405) {
          console.log(`ℹ️ INFO: Endpoint ${endpoint} not available (${endpointError.response?.status}), trying next endpoint`);
          continue;
        }

        // If we got a 400 (invalid credentials), that means the endpoint exists but credentials are wrong
        if (endpointError.response?.status === 400) {
          console.log(`ℹ️ INFO: Endpoint ${endpoint} exists but credentials invalid - throwing error`);
          throw endpointError;
        }

        // For other errors, continue to next endpoint
        continue;
      }
    }

    // If we get here, all endpoints failed with non-400 errors
    console.error(`🚨 ERROR: All authentication endpoints failed`);
    throw new Error('No valid authentication endpoint found');
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
    const response = await api.get('/users/me', {
      params: {
        populate: '*'
      }
    });
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
    console.log(`🔍 [CRUD] ${endpoint}.getAll called with params:`, params);
    try {
      const response = await api.get(`/${endpoint}`, { params });
      console.log(`✅ [CRUD] ${endpoint}.getAll SUCCESS:`, {
        status: response.status,
        dataCount: response.data?.data?.length || 0,
        hasData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : 'null'
      });
      return response.data; // Returns { data: [...], meta: {...} }
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.getAll ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  getById: async (id: string | number) => {
    console.log(`🔍 [CRUD] ${endpoint}.getById called with id:`, id);
    try {
      const response = await api.get(`/${endpoint}/${id}`);
      console.log(`✅ [CRUD] ${endpoint}.getById SUCCESS:`, {
        status: response.status,
        hasData: !!response.data?.data
      });
      return response.data; // Returns { data: {...} }
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.getById ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  },

  create: async (data: any) => {
    console.log(`🔍 [CRUD] ${endpoint}.create called with data:`, data);
    try {
      const response = await api.post(`/${endpoint}`, { data });
      console.log(`✅ [CRUD] ${endpoint}.create SUCCESS:`, {
        status: response.status,
        hasData: !!response.data?.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.create ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  update: async (id: string | number, data: any) => {
    console.log(`🔍 [CRUD] ${endpoint}.update called with id:`, id, 'data:', data);
    try {
      const response = await api.put(`/${endpoint}/${id}`, { data });
      console.log(`✅ [CRUD] ${endpoint}.update SUCCESS:`, {
        status: response.status,
        hasData: !!response.data?.data
      });
      return response.data;
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.update ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  delete: async (id: string | number) => {
    console.log(`🔍 [CRUD] ${endpoint}.delete called with id:`, id);
    try {
      const response = await api.delete(`/${endpoint}/${id}`);
      console.log(`✅ [CRUD] ${endpoint}.delete SUCCESS:`, {
        status: response.status,
        hasData: !!response.data?.data
      });
      return response.data; // Returns { data: {...}, meta: {...} }
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.delete ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  },

  // Custom query for Strapi filters
  find: async (filters = {}) => {
    console.log(`🔍 [CRUD] ${endpoint}.find called with filters:`, filters);
    try {
      const response = await api.get(`/${endpoint}`, {
        params: {
          populate: '*',
          ...filters,
        },
      });
      console.log(`✅ [CRUD] ${endpoint}.find SUCCESS:`, {
        status: response.status,
        dataCount: response.data?.data?.length || 0,
        hasData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : 'null'
      });
      console.log(`📊 [CRUD] ${endpoint}.find data sample:`, response.data?.data?.slice(0, 1));
      return response.data; // Returns { data: [...], meta: {...} }
    } catch (error: any) {
      console.error(`❌ [CRUD] ${endpoint}.find ERROR:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
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

// Sales Profile API
export const salesProfilesAPI = createCRUDAPI('sales-profiles');

// Information/Articles API
export const articlesAPI = createCRUDAPI('articles');

// Sales Monitoring API
export const salesMonitoringAPI = {
  // Get all sales profiles with their SPK data and populated relationships
  getSalesProfilesWithSPK: async () => {
    const response = await api.get('/sales-profiles', {
      params: {
        populate: '*',
        filters: {
          approved: true,
          blocked: false
        },
        sort: {
          updatedAt: 'desc'
        }
      }
    });
    return response.data;
  },

  // Get sales profiles filtered by online status
  getSalesProfilesByStatus: async (onlineStatus?: boolean) => {
    const filters: any = {
      approved: true,
      blocked: false
    };

    if (onlineStatus !== undefined) {
      filters.online_stat = onlineStatus;
    }

    const response = await api.get('/sales-profiles', {
      params: {
        populate: '*',
        filters,
        sort: {
          updatedAt: 'desc'
        }
      }
    });
    return response.data;
  },

  // Update sales profile location and online status
  updateSalesProfileLocation: async (profileId: number, location: { latitude: number; longitude: number }, onlineStatus: boolean) => {
    const response = await api.put(`/sales-profiles/${profileId}`, {
      data: {
        location,
        online_stat: onlineStatus,
        updatedAt: new Date().toISOString()
      }
    });
    return response.data;
  }
};

// User management API
export const usersAPI = {
  // Get all users with SALES role
  getSalesUsers: async () => {
    const response = await api.get('/users', {
      params: {
        filters: {
          role_custom: 'SALES'
        },
        populate: '*'
      }
    });
    return response.data;
  },

  // Update user data
  updateUser: async (userId: number, userData: any) => {
    const response = await api.put(`/users/${userId}`, { data: userData });
    return response.data;
  },

  // Get supervisors for dropdown
  getSupervisors: async () => {
    const response = await api.get('/supervisors', {
      params: {
        populate: '*'
      }
    });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/users/me', {
      params: {
        populate: '*'
      }
    });
    return response.data;
  }
};

// Categories API
export const categoriesAPI = createCRUDAPI('categories');

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