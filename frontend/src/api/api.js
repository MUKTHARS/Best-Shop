import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

class API {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  async request(config) {
    const token = await this.getToken();
    
    const requestConfig = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
    };

    try {
      const response = await this.client.request(requestConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.error || 'Request failed');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Request configuration error');
      }
    }
  }

  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  async setToken(token) {
    await AsyncStorage.setItem('token', token);
  }

  async removeToken() {
    await AsyncStorage.removeItem('token');
  }
}

class AuthAPI extends API {
  async login(username, password) {
    const response = await this.request({
      method: 'POST',
      url: '/login',
      data: { username, password },
    });
    await this.setToken(response.token);
    return response;
  }

  async register(userData) {
    return this.request({
      method: 'POST',
      url: '/register',
      data: userData,
    });
  }

  async getProfile() {
    return this.request({
      method: 'GET',
      url: '/profile',
    });
  }

  async logout() {
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

  async getBrands() {
    return this.request({
      method: 'GET',
      url: '/brands',
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
}

export const authAPI = new AuthAPI();
export const stockAPI = new StockAPI();
export const userAPI = new UserAPI();