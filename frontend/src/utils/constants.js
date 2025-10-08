// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 30000,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

// Role Permissions
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_stock',
    'view_reports',
    'manage_categories',
    'manage_brands',
  ],
  [USER_ROLES.MANAGER]: [
    'manage_stock',
    'view_reports',
    'manage_categories',
    'manage_brands',
  ],
  [USER_ROLES.EMPLOYEE]: [
    'manage_stock',
    'view_products',
  ],
};

// Stock Categories
export const STOCK_CATEGORIES = [
  { id: 1, name: 'Footwear', description: 'All types of footwear' },
  { id: 2, name: 'Luggage', description: 'Bags, suitcases, travel accessories' },
  { id: 3, name: 'Sports', description: 'Sports equipment and accessories' },
  { id: 4, name: 'General Goods', description: 'General merchandise items' },
  { id: 5, name: 'Baby World', description: 'Baby products and accessories' },
];

// Product Sizes
export const PRODUCT_SIZES = {
  FOOTWEAR: [
    '6', '7', '8', '9', '10', '11', '12',
    'S', 'M', 'L', 'XL'
  ],
  CLOTHING: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  GENERAL: ['One Size', 'Small', 'Medium', 'Large', 'Extra Large'],
};

// Product Colors
export const PRODUCT_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
  'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Multi-color'
];

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  QUALITY: 0.8,
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 1200,
};

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  ITEM_ID: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  ITEM_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 255,
  },
  PRICE: {
    MIN: 0,
    MAX: 999999.99,
  },
  QUANTITY: {
    MIN: 0,
    MAX: 999999,
  },
};

// Navigation Routes
export const ROUTES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  STOCK_ENTRY: 'StockEntry',
  STOCK_PREVIEW: 'StockPreview',
  PRODUCTS: 'Products',
  USERS: 'Users',
  REPORTS: 'Reports',
  SETTINGS: 'Settings',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  SERVER_ERROR: 'Server error - please try again later',
  UNAUTHORIZED: 'Unauthorized access - please login again',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  STOCK_ADDED: 'Stock entry added successfully',
  PRODUCT_ADDED: 'Product added successfully',
  USER_ADDED: 'User added successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
};

// App Themes
export const THEMES = {
  LIGHT: {
    primary: '#007AFF',
    secondary: '#6C757D',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    light: '#F8F9FA',
    dark: '#343A40',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#DDDDDD',
  },
  DARK: {
    primary: '#0A84FF',
    secondary: '#8E8E93',
    success: '#32D74B',
    danger: '#FF453A',
    warning: '#FFD60A',
    info: '#64D2FF',
    light: '#48484A',
    dark: '#1C1C1E',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
  },
};

// Default App Settings
export const DEFAULT_SETTINGS = {
  theme: 'LIGHT',
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  notifications: true,
  autoSync: true,
  lowStockThreshold: 10,
};