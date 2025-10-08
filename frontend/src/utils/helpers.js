import { Alert } from 'react-native';

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '-';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

// Format date time
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate random ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Validate file type
export const isValidImageType = (filename) => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return validExtensions.includes(extension);
};

// Get file size in MB
export const getFileSizeMB = (sizeInBytes) => {
  return (sizeInBytes / (1024 * 1024)).toFixed(2);
};

// Show alert with confirmation
export const showConfirmation = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};

// Show error alert
export const showError = (message, title = 'Error') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Show success alert
export const showSuccess = (message, title = 'Success') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Parse error message from API
export const parseErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response?.data?.error) return error.response.data.error;
  return 'An unexpected error occurred';
};

// Calculate total value
export const calculateTotalValue = (quantity, price) => {
  if (!quantity || !price) return 0;
  return parseFloat(quantity) * parseFloat(price);
};

// Generate stock report data
export const generateStockReport = (stockEntries) => {
  const report = {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categories: {},
  };

  stockEntries.forEach(entry => {
    report.totalItems += entry.current_quantity;
    report.totalValue += calculateTotalValue(entry.current_quantity, entry.selling_price);
    
    // Track low stock (less than 10 items)
    if (entry.current_quantity < 10 && entry.current_quantity > 0) {
      report.lowStockItems++;
    }
    
    // Track out of stock
    if (entry.current_quantity === 0) {
      report.outOfStockItems++;
    }

    // Track by category
    const category = entry.product?.category || 'Uncategorized';
    if (!report.categories[category]) {
      report.categories[category] = {
        count: 0,
        value: 0,
      };
    }
    report.categories[category].count += entry.current_quantity;
    report.categories[category].value += calculateTotalValue(entry.current_quantity, entry.selling_price);
  });

  return report;
};

// Filter products by search
export const filterProducts = (products, searchQuery) => {
  if (!searchQuery) return products;

  const query = searchQuery.toLowerCase();
  return products.filter(product =>
    product.item_name.toLowerCase().includes(query) ||
    product.item_id.toLowerCase().includes(query) ||
    (product.model && product.model.toLowerCase().includes(query)) ||
    (product.color && product.color.toLowerCase().includes(query)) ||
    (product.brand && product.brand.toLowerCase().includes(query))
  );
};

// Sort products
export const sortProducts = (products, sortBy, sortOrder = 'asc') => {
  return [...products].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};