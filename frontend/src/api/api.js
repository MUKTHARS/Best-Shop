import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native'; // Add this import

// Use different URLs based on platform
const API_BASE_URL = Platform.OS === 'android' ? 'http://192.168.43.41:8080' : 'http://localhost:8080';

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  platform: Platform.OS,
  androidNote: Platform.OS === 'android' ? 'Using 192.168.43.41 for Android emulator' : 'Using localhost'
});

class API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
      },
      (error) => {
        console.log('❌ Request interceptor error:', {
          message: error.message,
          code: error.code,
          config: error.config?.url
        });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.log('❌ Response interceptor error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code
        });
        return Promise.reject(error);
      }
    );
  }

  async request(config) {
    const token = await this.getToken();
    
    console.log('🔑 Token status:', token ? 'Available' : 'Not available');
    
    const requestConfig = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
    };

    try {
      console.log('🚀 Making API request:', {
        url: config.url,
        method: config.method,
        baseURL: this.baseURL
      });
      
      const response = await this.client.request(requestConfig);
      
      console.log('✅ API request successful:', {
        url: config.url,
        status: response.status
      });
      
      return response.data;
    } catch (error) {
      console.log('💥 API Request failed - Detailed analysis:', {
        url: config.url,
        fullURL: this.baseURL + config.url,
        method: config.method,
        errorMessage: error.message,
        errorCode: error.code,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        requestMade: !!error.request,
        serverResponded: !!error.response
      });
      
      if (error.response) {
        // Server responded with error status
        const errorMsg = error.response.data.error || `Server error: ${error.response.status}`;
        console.log('🔧 Server error details:', errorMsg);
        throw new Error(errorMsg);
      } else if (error.request) {
        // Request made but no response received
        console.log('🔧 Network error details: No response received from server');
        console.log('🔧 Possible causes:');
        console.log('   - Server is not running');
        console.log('   - Wrong IP address/port');
        console.log('   - Network connectivity issue');
        console.log('   - CORS policy blocking request');
        throw new Error(`Cannot connect to server at ${this.baseURL}`);
      } else {
        // Something else happened
        console.log('🔧 Configuration error:', error.message);
        throw new Error('Request configuration error: ' + error.message);
      }
    }
  }

  async getToken() {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.log('❌ Error getting token from storage:', error);
      return null;
    }
  }

  async setToken(token) {
    try {
      await AsyncStorage.setItem('token', token);
      console.log('✅ Token stored successfully');
    } catch (error) {
      console.log('❌ Error storing token:', error);
    }
  }

  async removeToken() {
    try {
      await AsyncStorage.removeItem('token');
      console.log('✅ Token removed successfully');
    } catch (error) {
      console.log('❌ Error removing token:', error);
    }
  }
}

class AuthAPI extends API {
  async login(username, password) {
    console.log('🔐 Starting login process:', { username });
    try {
      const response = await this.request({
        method: 'POST',
        url: '/login',
        data: { username, password },
      });
      await this.setToken(response.token);
      console.log('✅ Login successful for user:', username);
      return response;
    } catch (error) {
      console.log('❌ Login process failed:', {
        username,
        error: error.message,
        step: 'API request'
      });
      throw error;
    }
  }

  async register(userData) {
    console.log('👤 Starting user registration');
    return this.request({
      method: 'POST',
      url: '/register',
      data: userData,
    });
  }

  async getProfile() {
    console.log('📋 Fetching user profile');
    return this.request({
      method: 'GET',
      url: '/profile',
    });
  }

  async logout() {
    console.log('🚪 Logging out user');
    await this.removeToken();
  }
}


class StockAPI extends API {
  async getCategories() {
    return this.request({
      method: 'GET',
      url: '/categories',
    });
  }

  async createCategory(category) {
    return this.request({
      method: 'POST',
      url: '/categories',
      data: category,
    });
  }

  async createSubcategory(subcategoryData) {
    return this.request({
      method: 'POST',
      url: '/subcategories',
      data: subcategoryData,
    });
  }


  async getBrands() {
    return this.request({
      method: 'GET',
      url: '/brands',
    });
  }

   async updateProduct(productId, productData) {
    return this.request({
      method: 'PUT',
      url: `/products/${productId}`,
      data: productData,
    });
  }

  async deleteProduct(productId) {
    return this.request({
      method: 'DELETE',
      url: `/products/${productId}`,
    });
  }

  async createBrand(brand) {
    return this.request({
      method: 'POST',
      url: '/brands',
      data: brand,
    });
  }

  async getSubcategories(categoryId = null) {
    if (categoryId) {
      return this.request({
        method: 'GET',
        url: `/subcategories/category/${categoryId}`,
      });
    }
    return this.request({
      method: 'GET',
      url: '/subcategories',
    });
  }

  async createSubcategory(subcategory) {
    return this.request({
      method: 'POST',
      url: '/subcategories',
      data: subcategory,
    });
  }

  async getProducts() {
    return this.request({
      method: 'GET',
      url: '/products',
    });
  }

  async createProduct(product) {
    return this.request({
      method: 'POST',
      url: '/products',
      data: product,
    });
  }

  async getStockEntries() {
    return this.request({
      method: 'GET',
      url: '/stock-entries',
    });
  }

  async createStockEntry(entry) {
    return this.request({
      method: 'POST',
      url: '/stock-entries',
      data: entry,
    });
  }

  async uploadImage(formData) {
    const token = await this.getToken();
    
    console.log('📸 Uploading image...');
    
    const response = await axios.post(`${this.baseURL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });

    return response.data;
  }
}




class UserAPI extends API {
  async getUsers() {
    return this.request({
      method: 'GET',
      url: '/users',
    });
  }

  async updateUser(userId, userData) {
    return this.request({
      method: 'PUT',
      url: `/users/${userId}`,
      data: userData,
    });
  }

  async deleteUser(userId) {
    return this.request({
      method: 'DELETE',
      url: `/users/${userId}`,
    });
  }
  
}

export const authAPI = new AuthAPI();
export const stockAPI = new StockAPI();
export const userAPI = new UserAPI();