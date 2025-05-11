// Regular expression cho email
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regular expression cho phone number
export const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10,12}$/;

// Regular expression cho password (ít nhất 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số)
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Các hàm validation
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

export const isEmptyString = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === '';
};

export const isNumber = (value: any): boolean => {
  return !isNaN(Number(value));
};

export const isPositiveNumber = (value: any): boolean => {
  return isNumber(value) && Number(value) > 0;
};

export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = (value: any): boolean => {
  return Array.isArray(value);
};

export const isURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const sanitizeString = (value: string): string => {
  // Loại bỏ các ký tự HTML và những ký tự không an toàn
  return value
    .replace(/[<>]/g, '')
    .trim();
}; 