// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Minimum length validation
export const validateMinLength = (value, minLength) => {
  return value && value.toString().trim().length >= minLength;
};

// Maximum length validation
export const validateMaxLength = (value, maxLength) => {
  return value && value.toString().trim().length <= maxLength;
};

// Number validation
export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

// Price validation
export const validatePrice = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

// Phone number validation (basic)
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Stock form validation
export const validateStockForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.itemId)) {
    errors.itemId = 'Item ID is required';
  }

  if (!validateRequired(formData.itemName)) {
    errors.itemName = 'Item name is required';
  }

  if (!validateRequired(formData.purchaseQuantity)) {
    errors.purchaseQuantity = 'Purchase quantity is required';
  } else if (!validatePositiveNumber(formData.purchaseQuantity)) {
    errors.purchaseQuantity = 'Purchase quantity must be a positive number';
  }

  if (formData.mrp && !validatePrice(formData.mrp)) {
    errors.mrp = 'MRP must be a valid price';
  }

  if (formData.sellingPrice && !validatePrice(formData.sellingPrice)) {
    errors.sellingPrice = 'Selling price must be a valid price';
  }

  if (formData.purchasePrice && !validatePrice(formData.purchasePrice)) {
    errors.purchasePrice = 'Purchase price must be a valid price';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// User form validation
export const validateUserForm = (userData) => {
  const errors = {};

  if (!validateRequired(userData.username)) {
    errors.username = 'Username is required';
  } else if (!validateMinLength(userData.username, 3)) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!validateRequired(userData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(userData.password)) {
    errors.password = 'Password is required';
  } else if (!validateMinLength(userData.password, 6)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!validateRequired(userData.role)) {
    errors.role = 'Role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Login form validation
export const validateLoginForm = (loginData) => {
  const errors = {};

  if (!validateRequired(loginData.username)) {
    errors.username = 'Username is required';
  }

  if (!validateRequired(loginData.password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};